//PowerUp.js

function PowerUp(world, pos, yBound, powerType) {
	MovableObject.call(this, world, pos, [0, 0.1], 1);

	this.yBound = yBound;
	this.powerType = powerType;

    this.powerWidth = 1;
    this.powerHeight = .7;

    this.vertices = [];
    this.texCoords = [];
    this.normals = [];

    this.powerIndex = 0;
    switch(this.powerType) {
        case 'S':
            this.powerIndex = 0;
            break;
        case 'L':
            this.powerIndex = 1;
            break;
        case 'P':
            this.powerIndex = 2;
            break;
        case 'F':
            this.powerIndex = 3;
            break;
        case 'G':
            this.powerIndex = 4;
            break;
    }

    this.generateVertices(this.vertices, this.texCoords, this.normals);
}

PowerUp.prototype.generateVertices = function(buffer, texbuffer, normalbuffer) {
    buffer.push([1, 1, 0]);
    buffer.push([0, 1, 0]);
    buffer.push([0, 0, 0]);

    buffer.push([1, 1, 0]);
    buffer.push([0, 0, 0]);
    buffer.push([1, 0, 0]);

    texbuffer.push(texCoord[2]);
    texbuffer.push(texCoord[1]);
    texbuffer.push(texCoord[0]);
    texbuffer.push(texCoord[2]);
    texbuffer.push(texCoord[0]);
    texbuffer.push(texCoord[3]);

    normalbuffer.push([0, 0, 1]);
    normalbuffer.push([0, 0, 1]);
    normalbuffer.push([0, 0, 1]);
    normalbuffer.push([0, 0, 1]);
    normalbuffer.push([0, 0, 1]);
    normalbuffer.push([0, 0, 1]);

};

PowerUp.prototype.move = function () {
	if (this.pos[1] >= this.yBound){
		if (this.powerType == 'S' && this.lives != 0)
			this.lives -= 1;
		return;
	}
	// coin moves twice as fast
	if (this.powerType == 'S')
		this.pos[1] += (this.velocity[1] * 8);
	// all other power-ups move at same rate
	else
		this.pos[1] += this.velocity[1];

    return;
}

PowerUp.prototype.draw = function() {
    if (!pauseMode) {
        this.move();
    }

    var ctm = mat4();
    ctm = mult(ctm, translate(this.pos));
    ctm = mult(ctm, scale(0.5, 0.5, 0.5));
    GL.uniformMatrix4fv(UNIFORM_MODEL, false, flatten(ctm));

    GL.bindBuffer( GL.ARRAY_BUFFER, T_BUFFER );
    GL.bufferData( GL.ARRAY_BUFFER, flatten(this.texCoords), GL.STATIC_DRAW );
    
    var vTexCoord = GL.getAttribLocation( PROGRAM, "vTexCoord" );
    GL.vertexAttribPointer( vTexCoord, 2, GL.FLOAT, false, 0, 0 );
    GL.enableVertexAttribArray( vTexCoord );

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

    GL.bindTexture(GL.TEXTURE_2D, this.world.stageTextures[this.world.currStageIndex].item.textures[this.powerIndex]);
    GL.drawArrays(GL.TRIANGLES, 0, this.vertices.length);
}