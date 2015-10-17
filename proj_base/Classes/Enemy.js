// Enemy

var ENEMY_XVELO_CONSTANT = .025;
var ENEMY_GRAVITY_CONSTANT = -.0075;
var ENEMY_JUMP_CONSTANT = .20;

// TODO: specify which type of enemy in initialization
// 1 = back and forth
// 2 = flying
// etc...
function Enemy(world, pos, xBoundLeft, xBoundRight, yBoundLow, yBoundHigh, enemyType) {
    MovableObject.call(this, world, pos, [ENEMY_XVELO_CONSTANT, 0], 1);

    this.xBoundLeft = xBoundLeft;
    this.xBoundRight = xBoundRight;
    this.yBoundLow = yBoundLow;
    this.yBoundHigh = yBoundHigh;
    this.enemyType = enemyType;

    this.enemyWalkTimer = new Timer();
    this.enemyWalkTimer.reset();
    this.walkTime = 0;
    this.texIndex= 0;

    this.enemyWidth = .5;
    this.enemyHeight = .7;

    this.vertices = [];
    this.texCoords = [];
    this.normals = [];

    this.enemyIndex = 0;
    switch(this.enemyType) {
        case 'C':
            this.enemyIndex = 0;
            break;
        case 'J':
            this.enemyIndex = 1;
            break;
        case 'H':
            this.enemyIndex = 2;
            break;
        case 'V':
            this.enemyIndex = 3;
            this.velocity[1] = ENEMY_XVELO_CONSTANT;
            break;
    }

  

    this.generateVertices(this.vertices, this.texCoords, this.normals);

    this.bounds = [];
}

Enemy.prototype.generateVertices = function(buffer, texbuffer, normalbuffer) {
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

Enemy.prototype.draw = function() {
    if (!pauseMode)
        this.move();
    
    var ctm = mat4();
    ctm = mult(ctm, translate(this.pos));
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

    GL.bindTexture(GL.TEXTURE_2D, this.world.stageTextures[this.world.currStageIndex].enemies[this.enemyIndex].textures[this.animIndex()]);
    GL.drawArrays(GL.TRIANGLES, 0, this.vertices.length);

}

Enemy.prototype.animIndex = function() {
    this.walkTime += this.enemyWalkTimer.getElapsedTime()/80;
    this.texIndex = Math.floor(this.walkTime%this.world.stageTextures[this.world.currStageIndex].enemies[this.enemyIndex].textures.length/2)*2;
    if (this.velocity[0] < 0.0 || this.enemyIndex == 1 || this.enemyIndex == 3) 
        this.texIndex++;
    return this.texIndex;
}

Enemy.prototype.move = function () {

    var adjustedPos = this.pos[0] + (1-this.enemyWidth)/2;

	// Ground crawler == C or Horizontal Flyers == H
    if (this.enemyType == "C" || this.enemyType == "H") {
        if (this.xBoundLeft == this.xBoundRight)
            this.velocity[0] = 0;

        if (this.xBoundLeft < this.xBoundRight) {
            if (adjustedPos  < this.xBoundLeft || adjustedPos - this.enemyWidth > this.xBoundRight)
                this.velocity[0] = -this.velocity[0];
        }

        this.pos[0] += this.velocity[0];
    }

    // Vertical Flyers
    else if (this.enemyType == "V") {
        if (this.yBoundLow == this.yBoundHigh)
            this.velocity[1] = 0;

        if (this.yBoundLow < this.yBoundHigh) {
            if (this.pos[1]  < this.yBoundLow || this.pos[1] - this.enemyHeight > this.yBoundHigh)
                this.velocity[1] = -this.velocity[1];
        }

        this.pos[1] += this.velocity[1];
    }

    // Jumpers
    else if (this.enemyType == 'J') {
        if (this.pos[1] <= this.yBoundLow)
            this.velocity[1] = ENEMY_JUMP_CONSTANT;

        if (this.pos[1] > this.yBoundLow)
            this.velocity[1] += ENEMY_GRAVITY_CONSTANT;

        this.pos[1] += this.velocity[1];
    }

    // reasonably smart AI
    else if (this.enemyType == 'A') {

        // check if mario is close
        var xDistPlayer = this.pos[0] - this.world.player.pos[0];
        var yDistPlayer = Math.abs(this.world.player.pos[1] - this.pos[1]);

        // default crawler movement
        if (this.xBoundLeft == this.xBoundRight)
            this.velocity[0] = 0;

        var speedUp;
        if (yDistPlayer <= 1 && Math.abs(xDistPlayer) <= 4) {
            speedUp = 1.65;
            if (xDistPlayer > 0) {
                this.velocity[0] = -Math.abs(this.velocity[0]);
            }
            else if (xDistPlayer < 0) {
                this.velocity[0] = Math.abs(this.velocity[0]);
            }
            
        }
        else {
            speedUp = 1.0;
        }

        if (this.xBoundLeft < this.xBoundRight && speedUp == 1.0) {
            if (adjustedPos  < this.xBoundLeft) {
                this.velocity[0] = Math.abs(this.velocity[0]);
            }
            else if (adjustedPos - this.enemyWidth > this.xBoundRight && speedUp == 1.0) {
                this.velocity[0] = -Math.abs(this.velocity[0]);
            }
        }


        this.pos[0] += this.velocity[0] * speedUp;

        this.pos[0] = Math.max(this.xBoundLeft - (1 - this.enemyWidth) / 2 - .05, this.pos[0]);
        this.pos[0] = Math.min(this.xBoundRight + (1 - this.enemyWidth) / 2 + .05, this.pos[0]);


        // intelligent projectile avoidance
        for (var i = 0; i < this.world.projectiles.length; i++) {
            var xDist = Math.abs(this.pos[0] - this.world.projectiles[i].pos[0]);
            var yDist = Math.abs(this.world.projectiles[i].pos[1] - this.pos[1]);
            if (yDist > 1) {
                continue;
            }

            if (xDist <= 3 && xDist > 0) {
                if (this.pos[1] <= this.yBoundLow) {
                    this.velocity[1] = ENEMY_JUMP_CONSTANT;
                    this.pos[1] += this.velocity[1];
                    return;
                }
            }

        }

        if (this.pos[1] > this.yBoundLow) {
            this.velocity[1] += ENEMY_GRAVITY_CONSTANT;
        }

        if (this.pos[1] <= this.yBoundLow) {
            this.velocity[1] = 0;
            this.pos[1] = this.yBoundLow;
        }

        this.pos[1] += this.velocity[1];
    }

    return;
}