// Background.js

function Background(world) {
    DrawableObject.call(this);

    this.world = world;
    this.vertices = [];
    this.texCoords = [];
    this.normals = [];

    this.generateVertices(this.vertices, this.texCoords);
    this.generateNormals(this.normals);
}

Background.prototype.generateVertices = function(vBuffer, tBuffer) {
    quad([16, 16, -3], [16, -1, -3], [-1, 16, -3], [-1, -1, -3], vBuffer, tBuffer);
};

Background.prototype.generateNormals = function(nBuffer)
{
    for(var i = 0; i < 6; i++)
        nBuffer.push([1,0,0]);
};

Background.prototype.draw = function() {
    var ctm = mat4();
    ctm = mult(ctm, translate([INITIAL_CAMERA_POS[0] - CAMERA_POS[0], 0, 0]))
    GL.uniformMatrix4fv(UNIFORM_MODEL, false, flatten(ctm));

    GL.bindBuffer( GL.ARRAY_BUFFER, V_BUFFER );
    GL.bufferData( GL.ARRAY_BUFFER, flatten(this.vertices), GL.STATIC_DRAW );
 
    var vPosition = GL.getAttribLocation( PROGRAM, "vPosition" );
    GL.vertexAttribPointer( vPosition, 3, GL.FLOAT, false, 0, 0 );
    GL.enableVertexAttribArray( vPosition );

    GL.bindBuffer( GL.ARRAY_BUFFER, N_BUFFER );
    GL.bufferData( GL.ARRAY_BUFFER, flatten(this.normals), GL.STATIC_DRAW );

    var vNormal = GL.getAttribLocation( PROGRAM, "vNormal");
    GL.vertexAttribPointer( vNormal, 3, GL.FLOAT, false, 0, 0 );
    GL.enableVertexAttribArray( vNormal );

    var translatedTexCoords = [];
    for (var i = 0; i < this.texCoords.length; i++) {
        translatedTexCoords.push([
            this.texCoords[i][0] + (INITIAL_CAMERA_POS[0] - CAMERA_POS[0])/30,
            this.texCoords[i][1]
        ]);
    }

    GL.bindBuffer( GL.ARRAY_BUFFER, T_BUFFER );
    GL.bufferData( GL.ARRAY_BUFFER, flatten(translatedTexCoords), GL.STATIC_DRAW );
    
    var vTexCoord = GL.getAttribLocation( PROGRAM, "vTexCoord" );
    GL.vertexAttribPointer( vTexCoord, 2, GL.FLOAT, false, 0, 0 );
    GL.enableVertexAttribArray( vTexCoord );

    GL.bindTexture(GL.TEXTURE_2D, this.world.stageTextures[this.world.currStageIndex].background.textures[0]);
    GL.drawArrays(GL.TRIANGLES, 0, this.vertices.length);

    GL.uniformMatrix4fv(UNIFORM_PROJECTION, false, flatten(PERSPECTIVE));
};