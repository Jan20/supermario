// stage.js

function Stage(world, stage) {
    DrawableObject.call(this);
    
    this.stage = stage;
    this.world = world;

    this.finishLine = this.stage[0].length - 1;

    // Enemy Codes (Don't use):
    // H, J, C, V
    this.texIndexMap = {
        'X': 0, //Ground
        'B': 1, //Brick (Floating block)
        'Y': 2, //Item block
        'L': 2, //Life Power-up
        'P': 2, //Projectile
        'F': 2, //Fast Power-up
        'G': 2, //Anti-gravity Power-up
        'S': 3, //Coin/Score block
        'D': 4,  //Block
        'Z': 5, // finish checkerboard pattern
    };

    this.runningSum = {};
    this.vertices = {};
    this.texCoords = {};
    this.normals = {};
    
    for (var key in this.texIndexMap) {
        this.runningSum[key] = [0];
        this.vertices[key] = [];
        this.texCoords[key] = [];
        this.normals[key] = [];
    }

    this.generateVertices();
    //this.generateNormals(this.normals);
}

Stage.prototype.generateVertices = function() {
    for (var i = 0; i < this.stage[0].length; i++) {

        for (var j = 0; j < this.stage.length; j++) {
                var currentSquare = this.stage[j][i];
                if (i > 0 && j == 0) {
                    for (var key in this.texIndexMap)
                        this.runningSum[key].push(this.runningSum[key][i-1]);
                }
            if (this.stage[j][i] != '.') {
                var y = 14 - j;
                var x = i;

                // front, right, top, left, bottom
                quad([x+1, y+1, 0], [x+1, y, 0], [x, y+1, 0], [x, y, 0], this.vertices[currentSquare], this.texCoords[currentSquare]);
                quad([x+1, y+1, -3], [x+1, y, -3], [x+1, y+1, 0], [x+1, y, 0], this.vertices[currentSquare], this.texCoords[currentSquare]);
                quad([x+1, y+1, -3], [x+1, y+1, 0], [x, y+1, -3], [x, y+1, 0], this.vertices[currentSquare], this.texCoords[currentSquare]);
                quad([x, y+1, 0], [x, y, 0], [x, y+1, -3], [x, y, -3], this.vertices[currentSquare], this.texCoords[currentSquare]);
                quad([x+1, y, 0], [x+1, y, -3], [x, y, 0], [x, y, -3], this.vertices[currentSquare], this.texCoords[currentSquare]);
                this.generateNormals(this.normals[currentSquare]);
                this.runningSum[currentSquare][i] += 30;

                if (this.stage[j][i] == 'Z') {
                    this.finishLine = x;
                } 
            }
        };
    }
}

Stage.prototype.generateNormals = function(nBuffer) {
    // front
    nBuffer.push([0, 0, 1]);
    nBuffer.push([0, 0, 1]);
    nBuffer.push([0, 0, 1]);
    nBuffer.push([0, 0, 1]);
    nBuffer.push([0, 0, 1]);
    nBuffer.push([0, 0, 1]);

    // right
    nBuffer.push([1, 0, 0]);
    nBuffer.push([1, 0, 0]);
    nBuffer.push([1, 0, 0]);
    nBuffer.push([1, 0, 0]);
    nBuffer.push([1, 0, 0]);
    nBuffer.push([1, 0, 0]);

    // top
    nBuffer.push([0, 1, 0]);
    nBuffer.push([0, 1, 0]);
    nBuffer.push([0, 1, 0]);
    nBuffer.push([0, 1, 0]);
    nBuffer.push([0, 1, 0]);
    nBuffer.push([0, 1, 0]);

    // left
    nBuffer.push([-1, 0, 0]);
    nBuffer.push([-1, 0, 0]);
    nBuffer.push([-1, 0, 0]);
    nBuffer.push([-1, 0, 0]);
    nBuffer.push([-1, 0, 0]);
    nBuffer.push([-1, 0, 0]);

    // bottom
    nBuffer.push([0, -1, 0]);
    nBuffer.push([0, -1, 0]);
    nBuffer.push([0, -1, 0]);
    nBuffer.push([0, -1, 0]);
    nBuffer.push([0, -1, 0]);
    nBuffer.push([0, -1, 0]);
};

Stage.prototype.draw = function() {
    GL.disable(GL.BLEND);

    for (var key in this.texIndexMap) {
        if (this.vertices[key].length == 0)
            continue;

        var xBoundLeft = Math.max(Math.floor(this.world.xBoundLeft) - 2, 0);
        var xBoundRight = Math.min(Math.floor(this.world.xBoundRight) + 2, this.stage[0].length-1);
        
        var numVertices = this.runningSum[key][xBoundRight] - this.runningSum[key][xBoundLeft] +
                            + (this.runningSum[key][xBoundLeft] - ((xBoundLeft == 0) ? 0 : this.runningSum[key][xBoundLeft - 1]));

        var ctm = mat4();
        GL.uniformMatrix4fv(UNIFORM_MODEL, false, flatten(ctm));


        GL.bindBuffer( GL.ARRAY_BUFFER, V_BUFFER );
        GL.bufferData( GL.ARRAY_BUFFER, flatten(this.vertices[key]), GL.STATIC_DRAW );
     
        var vPosition = GL.getAttribLocation( PROGRAM, "vPosition" );
        GL.vertexAttribPointer( vPosition, 3, GL.FLOAT, false, 0, 0 );
        GL.enableVertexAttribArray( vPosition );

        GL.bindBuffer( GL.ARRAY_BUFFER, N_BUFFER );
        GL.bufferData( GL.ARRAY_BUFFER, flatten(this.normals[key]), GL.STATIC_DRAW );

        var vNormal = GL.getAttribLocation( PROGRAM, "vNormal");
        GL.vertexAttribPointer( vNormal, 3, GL.FLOAT, false, 0, 0 );
        GL.enableVertexAttribArray( vNormal );

        GL.bindBuffer( GL.ARRAY_BUFFER, T_BUFFER );
        GL.bufferData( GL.ARRAY_BUFFER, flatten(this.texCoords[key]), GL.STATIC_DRAW );
        
        var vTexCoord = GL.getAttribLocation( PROGRAM, "vTexCoord" );
        GL.vertexAttribPointer( vTexCoord, 2, GL.FLOAT, false, 0, 0 );
        GL.enableVertexAttribArray( vTexCoord );


        GL.bindTexture(GL.TEXTURE_2D, this.world.stageTextures[this.world.currStageIndex].stage.textures[this.texIndexMap[key]]);
        GL.drawArrays(GL.TRIANGLES, ((xBoundLeft == 0) ? 0 : this.runningSum[key][xBoundLeft - 1]), numVertices);
    }

    GL.enable(GL.BLEND);
};