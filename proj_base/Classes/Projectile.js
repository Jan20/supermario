var PROJECTILE_X_VELO = X_VELO_CONSTANT * 12;

function Projectile(world, pos, rowsToCheck) {
    MovableObject.call(this, world, pos, [PROJECTILE_X_VELO, 0], 1);

    this.vertices = [];
    this.texCoords = [];
    this.normals = [];

    this.rotationAngle = 0;

    this.generateVertices(this.vertices, this.texCoords, this.normals);

    this.rowsToCheck = rowsToCheck;

	this.xBoundLeft = 0;
	this.xBoundRight = Math.ceil(STAGES[world.currStageIndex][0].length);

	this.velocity[0] = (this.world.player.texDir == 0) ? this.velocity[0] : -this.velocity[0];

	for (var i = 0; i < this.rowsToCheck.length; i++) {
		// min
		for (var k = Math.floor(this.pos[0]); k >= 0; k--)
		    if (this.world.stage.stage[14 - (this.rowsToCheck[i]) ][k] != '.') {
		        this.xBoundLeft = k+1;
		        break;
		    }

		// max
		for (var k = Math.floor(this.pos[0]); k < Math.ceil(STAGES[world.currStageIndex][0].length); k++)
		    if (this.world.stage.stage[14 - (this.rowsToCheck[i]) ][k] != '.') {
		        this.xBoundRight = k-1;
		        break;
		    }
	}
}

Projectile.prototype.generateVertices = function(buffer, texbuffer, normalbuffer) {
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

Projectile.prototype.move = function() {
    this.pos[0] += this.velocity[0];
    if (this.pos[0] >= this.xBoundRight || this.pos[0] <= this.xBoundLeft) {
    	this.lives = 0;
    }

// HANDLE Enemy collisions, using world's list of enemies
    for (var i = 0; i < this.world.enemies.length; i++) {
        var curEnemy = this.world.enemies[i];

        if ( !(curEnemy.pos[0] + 1 > this.xBoundLeft && curEnemy.pos[0] - 1 < this.xBoundRight) )
            continue;

        // Bounding boxes intersect
        var adjustedEnemyPos = curEnemy.pos[0] + (1 - curEnemy.enemyWidth)/2;

        if ((Math.abs(this.pos[0] - adjustedEnemyPos)) * 2 < (this.velocity[0] + curEnemy.enemyWidth) &&
            (Math.abs(this.pos[1] - curEnemy.pos[1])) * 2 < (.5 + curEnemy.enemyHeight) ) {
            // Need to detect which collision happened, vertical or horizontal
            this.lives = 0;
            this.world.score += 100;
            this.world.getScore();

            var enemyKillSound = new Audio('../Sound/Stomp.mp3');
            enemyKillSound.play();

            this.world.deadEnemies.push(this.world.enemies[i]);
            this.world.enemies.splice(i, 1);
            i--;

        }
    }

};

Projectile.prototype.draw = function() {
    if (!pauseMode) {
        this.move();
    }

    var ctm = mat4();
    ctm = mult(ctm, translate([0, 0, 0.5]));
    ctm = mult(ctm, translate(this.pos));
    ctm = mult(ctm, translate([.5, .5, 0]));
    ctm = mult(ctm, rotate(this.rotationAngle, [0, 0, 1]));
    ctm = mult(ctm, translate([-.5, -.5, 0]));
    GL.uniformMatrix4fv(UNIFORM_MODEL, false, flatten(ctm));

    this.rotationAngle += 12;

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

    GL.bindTexture(GL.TEXTURE_2D, this.world.stageTextures[this.world.currStageIndex].projectile.textures[0]);
    GL.drawArrays(GL.TRIANGLES, 0, this.vertices.length);

};