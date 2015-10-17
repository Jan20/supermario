//Texture Config 

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

function configureTexture(image, textures, i) {
    textures[i] = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_2D, textures[i]);
    GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, 
         GL.RGBA, GL.UNSIGNED_BYTE, image);
    GL.generateMipmap(GL.TEXTURE_2D);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, //minification filter
                      GL.NEAREST_MIPMAP_LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST); //magnification filter
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.REPEAT);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    GL.uniform1i(GL.getUniformLocation(PROGRAM, "texture"), 0);
}

function loadImageRec(urls, textures, i) {
    if (urls.length == 0) {
        return;
    }
    var image = new Image();
    image.src = urls[0];
    image.onload = function() {
        configureTexture(image, textures, i);
    }
    loadImageRec(urls.slice(1), textures, i+1);
}

function loadImages(urls, textures) {
    loadImageRec(urls, textures, 0);
};



/*
        "Images/Mario/Char/idle.png",
        "Images/Mario/Char/idleback.png",
        "Images/Mario/Char/walk1.png",
        "Images/Mario/Char/walk1back.png",
        "Images/Mario/Char/walk2.png",
        "Images/Mario/Char/walk2back.png",
        "Images/Mario/Char/walk3.png",
        "Images/Mario/Char/walk3back.png",
        "Images/Mario/Char/jump.png",
        "Images/Mario/Char/jumpback.png"*/