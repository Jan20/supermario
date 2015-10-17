/* MovableObject class
- goomba, koopa, enemies, Player, anything that moves/has lives

-virtual functions: move, draw

*/

function MovableObject(world, pos, velocity, lives) {
    DrawableObject.call(this);

	this.world = world;
	this.pos = pos;
	this.velocity = velocity;
	this.lives = lives;
}
