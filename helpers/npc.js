import Character from './character';
import Pathfinder from './pathfinder';

export default class NPC extends Character {
 	constructor (args) {
      super(args);
      this.targetCell = false;
      this.cell = false;
      this.path = false;
      this.respawnTime = args.respawnTime || 5;
      this.respawnCountdown = this.respawnTime;
    }
  
  update(delta) {
     if (!this.alive) {
       this.respawnCountdown -=delta/1000;
       if (this.respawnCountdown < 0)
         this.respawn();
       return;
     }
     if (this.target) {
       this.approachTarget();
       
       
     }
     
      super.update(delta);
  }
  
  approachTarget() {
  
  	//Face target if in range
  	if (this.getDistToLoc({x:this.target.x, y:this.target.y}) < this.attackRange) {
  		this.stopMoving();
  		this.faceTarget();
        return
		}
    const thisCell=this.getMapCell();
    const targetCell = this.target.getMapCell();
    //If in neighboring horizontal or vertical cell or current cell go straight to target
  	if (Math.abs(thisCell.column-targetCell.column)
        + Math.abs(thisCell.row - targetCell.row) <2) {
  		this.faceTarget();
  		if (!this.isMovingForward)
  			this.moveForward();
  	}
    else {
      //Check if target has moved to another map cell since last calculated path
      if (!this.path || !this.targetCell || 
          !this.matchingCells(this.targetCell,this.target.getMapCell()) || !this.cell ||
          !this.matchingCells(this.cell, this.getMapCell())) {
       
      	this.targetCell = this.target.getMapCell();
      	this.cell = this.getMapCell();
        this.path = Pathfinder.getPathFromToInMap({x:this.cell.column, y:this.cell.row}, 
                                                  {x:this.targetCell.column, y:this.targetCell.row}, 
                                                  this.scene.map);
      	if (this.path.length >0) {
        	const nextPathLoc = this.scene.map.getCenterOfCell(this.path[0].x, this.path[0].y);
          	const radiansToTarget = Phaser.Math.Angle.Between(this.x, 
                                                              this.y, 
                                                              nextPathLoc.x, 
                                                              nextPathLoc.y);
            const degreesToTarget = Phaser.Math.RadToDeg(radiansToTarget);
            this.updatedValues.angle= this.angle=degreesToTarget;
          	if (!this.isMovingForward)
              this.moveForward();
        }
      }
    }
  }
  
  matchingCells(a, b) {
  	if (a.column === b.column && a.row === b.row)
      return true;
    return false;
  }
  
  faceTarget() {
  	const radiansToTarget = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
    const degreesToTarget = Phaser.Math.RadToDeg(radiansToTarget);
    this.updatedValues.angle= this.angle=degreesToTarget;
  }
  
  removeHp(hp,attacker) {
      //Attack back
        if (!this.target && attacker) {
          this.setTarget(attacker.id);
          this.toggleAttacking();
        }
        return super.removeHp(hp, attacker);
  }
  
  respawn() {
   	this.alive = true;
    this.updatedValues.x = this.x = this.spawnPoint.x;
    this.updatedValues.y = this.y = this.spawnPoint.y;
    this.body.setPosition(this.x,this.y);
    this.updatedValues.hp = this.hp = this.maxHp;
    this.respawnCountdown = this.respawnTime;
    this.updatedValues.angle = this.angle = this.spawnAngle;
    this.attacking = false;
    this.primaryAttackReady= true;
    this.primaryAttackTimer = 0;
    this.target = false;
    this.scene.characterRespawned(this.id);
    
    
  }
  
  
}
