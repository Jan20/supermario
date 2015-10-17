var canvas;
var gameScreen = 1;
var gameOver = 0;
var stage = 0;

var GL;
var PROGRAM;

var pixels;
 
var UNIFORM_MODEL;
var UNIFORM_CAMERA_X;

// perspective
var UNIFORM_PROJECTION;
var UNIFORM_VIEW;
var V_BUFFER;
var T_BUFFER;

//light
var UNIFORM_LIGHTPOSITION;
var UNIFORM_SHININESS;
var UNIFORM_SHADOWMAP;
var UNIFORM_SHADOW_VIEW;
var lightPosition = vec3(0.0, 15.0, -1.0);
var shininess = 50;

// moving
var CAMERA_POS;

var GAMEWORLD;

var frameBuffer;
var shadowTexture;
 
// correct camera view
var FOVY = 30;
var INITIAL_CAMERA_POS = vec3(-7.5, -7.5, -7.5/Math.tan(radians(FOVY/2)));
var ASPECT_RATIO = 1;

var PERSPECTIVE = perspective(FOVY, ASPECT_RATIO, 0.1, 500);

var TITLE_MAP = {
    0: 'Mario',
    1: 'Samus',
    2: 'Kirby',
    3: 'Link'
};

// gamescreen event listener
document.addEventListener('keydown', function(evt) {
        if (evt.keyCode == 38 && gameScreen) {
            if (stage-1 >= 0) {
                var current = document.getElementById(stage);
                var previous = document.getElementById(stage-1)

                previous.style.display = "inline";
                current.style.display = "none";
                stage -= 1;
                document.getElementById("stage-title").innerHTML = TITLE_MAP[stage];
            }
        } else if (evt.keyCode == 40 && gameScreen) {
            if (stage+1 <= 3) {
                var current = document.getElementById(stage);
                var next = document.getElementById(stage+1);
                next.style.display = "inline";
                current.style.display = "none";
                stage += 1;
                document.getElementById("stage-title").innerHTML = TITLE_MAP[stage];
            }
        // select stage to play
        } else if ((evt.keyCode == 13 || evt.keyCode == 32) && gameScreen) {
            document.getElementById("start").style.display = "none";
            gameScreen = 0;
            init();
        } 
    }, false);

function init()
{
    canvas = document.getElementById("gl-canvas");
    GL = WebGLUtils.setupWebGL(canvas);
    if (!GL) { alert("WebGL isn't available"); }

    ext = GL.getExtension('WEBGL_depth_texture');
    if(!ext) {
        alert("Depth Texture Extension Not Applicable");}
 
    GL.viewport(0, 0, canvas.width, canvas.height);
    GL.clearColor(1.0, 1.0, 1.0, 1.0);
     
    GL.enable(GL.DEPTH_TEST);
    GL.enable(GL.BLEND);
    GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
    //GL.blendFuncSeparate(GL.ONE_MINUS_DST_COLOR, GL.SRC_COLOR, GL.SRC_ALPHA, GL.CONSTANT_SRC_ALPHA);
    //
    //  Load shaders and initialize attribute buffers
    //
    PROGRAM = initShaders(GL, "vertex-shader", "fragment-shader");
    GL.useProgram(PROGRAM);
 
    V_BUFFER = GL.createBuffer();
    T_BUFFER = GL.createBuffer();
    N_BUFFER = GL.createBuffer();
    S_BUFFER = GL.createBuffer();

    UNIFORM_MODEL = GL.getUniformLocation(PROGRAM, "modelMatrix");
    UNIFORM_PROJECTION = GL.getUniformLocation(PROGRAM, "perspectiveMatrix");
    UNIFORM_VIEW = GL.getUniformLocation(PROGRAM, "viewMatrix");
    UNIFORM_LIGHTPOSITION = GL.getUniformLocation(PROGRAM, "lightPostion");
    UNIFORM_SHININESS = GL.getUniformLocation(PROGRAM, "shininess");
    UNIFORM_SHADOWMAP = GL.getUniformLocation(PROGRAM, "shadowMap");
    UNIFORM_SHADOW_VIEW = GL.getUniformLocation(PROGRAM, "shadowViewMatrix");
    UNIFORM_CAMERA_X = GL.getUniformLocation(PROGRAM, "cameraX");

    
    // set initial camera position
    CAMERA_POS = INITIAL_CAMERA_POS.slice(0);

    GAMEWORLD = new World(stage);

    // for hud initialization
    resetTimer();
    myTimer();
    GAMEWORLD.getScore();
    GAMEWORLD.getLives();
    GAMEWORLD.getWorldLevel();

    //initShadowBuffers();
    render();
}
 
function initShadowBuffers() {

    // Create a color texture
    colorTexture = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_2D, colorTexture);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);   
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, 512, 512, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);

    shadowTexture = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_2D, shadowTexture);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.DEPTH_COMPONENT, 512, 512, 0, GL.DEPTH_COMPONENT, GL.UNSIGNED_SHORT, null);

    frameBuffer = GL.createFramebuffer();
    GL.bindFramebuffer(GL.FRAMEBUFFER, frameBuffer);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, colorTexture, 0);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.TEXTURE_2D, shadowTexture, 0);
    
    GL.activeTexture(GL.TEXTURE1);
    GL.bindTexture(GL.TEXTURE_2D, colorTexture);
    GL.uniform1i(UNIFORM_SHADOWMAP, 1);
    GL.activeTexture(GL.TEXTURE0);

    GL.bindTexture(GL.TEXTURE_2D, null);
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);
}
 
function render()
{
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    // Set the perspective
    GL.uniformMatrix4fv(UNIFORM_PROJECTION, false, flatten(PERSPECTIVE));
 
/*    //Bind depth buffer
    GL.bindFramebuffer(GL.FRAMEBUFFER, frameBuffer);

    //Set light view matrix
    var lightView = mat4();
    lightView = mult(lightView, lookAt(vec3(-10.0, 15.0, -1.0), vec3(20,0,-1.0), vec3(0,1,0)));
    GL.uniformMatrix4fv(UNIFORM_VIEW, false, flatten(lightView));
    GL.uniformMatrix4fv(UNIFORM_SHADOW_VIEW, false, flatten(lightView));

    //Draw world from light view
    //GAMEWORLD.draw();

    GL.bindTexture(GL.TEXTURE_2D, shadowTexture);
    
    //debug shadows
    var canRead = (GL.checkFramebufferStatus(GL.FRAMEBUFFER) == GL.FRAMEBUFFER_COMPLETE);
    if (canRead) {
        pixels = new Uint8Array(512 * 512 * 4);
        GL.readPixels(0, 0, 512, 512, GL.RGBA, GL.UNSIGNED_BYTE, pixels);

    }

    //Bind buffer back
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);

    GL.uniform1i(UNIFORM_SHADOWMAP, 0);*/
 
    GL.uniform1f(UNIFORM_CAMERA_X, -CAMERA_POS[0]);
    // Set the view
    var vtm = mat4();
 
    // initial CameraPos set in main to (0, 0, -40) to view all cubes
    vtm = mult(vtm, translate(CAMERA_POS));
    GL.uniformMatrix4fv(UNIFORM_VIEW, false, flatten(vtm));
 
    
    //  Set lighting
    GL.uniform3fv(UNIFORM_LIGHTPOSITION,  flatten(lightPosition));
    GL.uniform1f(UNIFORM_SHININESS,  shininess);

    // Draw the world and everything in it    
    GAMEWORLD.draw();

    requestAnimFrame(render);
}