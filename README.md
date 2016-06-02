## Super Mario: WebGL

Our term project is a platform sidescroller derived from "Mario World" with multiple playable
characters and unique stages in the respective worlds.  Each character progresses through their
level populated with enemies taken from their respective world, complete with power ups consisting
of projectiles, coins, and more.

Make sure your broswer supports WebGL!


## Game Info

1. **Gameplay**:  Kill enemies by jumping on top of them. Collect power ups and coins by jumping into
special blocks. Reach the end of the stage without dying.

2. **Controls**: 
	* Arrow Keys: Player movement (down arrow not used) and menu selection. 
	* Spacebar: Fire projectile (once finding the projectile power up). 
	* P: Pause the game.

3. **Physics**: The player and the enemies that jump follow parabolic motion in their ascent  and descent.
The player's jump is not exactly parabolic to enhance gameplay as the  purely parabolic motion lead
to too much floating at the apex of the jump.  Instead, as the player's upward velocity approaches a
value near zero, he immediately starts descending and falling according to gravity. Horizontal
motion is also affected by  ground friction and continually slows down movement in the X direction.

4. **Collision Detection**: Collision detection relies on using the Separating Axis Theorem to determine
any possible collisions between objects. The stage is stored in a grid layout, while the characters
are texture mapped to squares. Taking into account each objects' height and width, the collisions
are possible by creating  AABB (Axis Alligned Bounding Boxes) for each object and applying the
Separating Axis Theorem. The collisions are inelastic and either kill the player, kill the enemy,
or stop the player from moving through the stage.

5. **Artificial Intelligence**: The movement of the crawling enemies is governed by an articial intlligence
which reacts to the player's movements and proximity of projectiles. If an enemy detecs that the
player is nearby, it switches directions (if necessary) and moves slightly faster. If the enemy
detects a projectile that it will collide with in the next few frames, it will jump to avoid it.
