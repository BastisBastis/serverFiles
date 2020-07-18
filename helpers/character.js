import CombatEngine from './combatEngine';
import ItemManager from './itemManager';
 
let idCounter=1;

export default class Character {
    constructor({
    scene, 
    x=200, 
    y=200, 
    sprite_key='arrow', 
    scale=0.5, 
    angle=0, 
    spawnAngle = 0,
    id, 
    maxHp=100,
    hp,
    movementSpeed=20,
    damage=10,
    attackRating=10,
    defense=5,
    delay=10,
    name,
    tint="#000000",
    bodyRadius=6,
    attackRange= 30,
    attacking=false,
    spawnPoint = {x:100, y:100},
    level=1,
    experience=0,
    hpRegen=4,
    equipmentSlots={
    		chest:false,
    		legs:false,
    		main:false},
    inventorySlots={
    		inv1:false,
    		inv2:false,
    		inv3:false,
    		inv4:false},
    alive=true  
    }) {
    	this.scene = scene;
    		
        //Character variables
        this.maxHp = maxHp;
        this.hp = (hp ? hp:maxHp);
        this.movementSpeed = movementSpeed;
      	this.turningSpeed = 1;
      	this.damage=damage;
      	this.attackRating=attackRating;
      	this.defense=defense;
      	this.delay=delay;
      	this.target=false;
      	this.name=name || "Character"+(idCounter++);
      	this.tint=tint;
        this.attackRange = attackRange;
      	this.spawnPoint = spawnPoint;
        this.level=level;
        this.experience=experience;
      	this.hpRegen=hpRegen;
      	this.equipmentSlots= equipmentSlots;
      	this.inventorySlots=inventorySlots;
      
      	//combat variables
      	this.attacking = attacking;
      	this.primaryAttackReady= true;
      	this.primaryAttackTimer = 0;
        this.alive = alive;
        
        //Position, physics and visuals
        this.sprite_key = sprite_key;
        this.scale = scale;
      	this.angle = angle;
      	this.spawnAngle = spawnAngle;
      	this.x = x;
      	this.y = y;
      	this.id = id || "characterId"+idCounter++;
      	this.bodyRadius=bodyRadius;
      	this.offset= this.bodyRadius*1;
      	
      
      	//Set up the physics body 
      	this.body = scene.add.circle(x+this.offset, y+this.offset, this.bodyRadius);
      	scene.physics.add.existing(this.body);
		this.body.body.setCircle(this.bodyRadius);
				

      	this.body.setOrigin(0.5,0.5);

      
      	//Character variables
      	this.isMovingForward = false;
      	this.isMovingBackward = false;
      	this.isTurningLeft = false;
      	this.isTurningRight = false;
      	
      	//Store updated that should be passed on to the client
      	this.updatedValues={};
      	
    }
  
  	switchItemSlots(a, b) {
      let containerA = this.equipmentSlots;
      let containerB = this.equipmentSlots;
      if (a.startsWith('inv'))
        containerA = this.inventorySlots;
      if (b.startsWith('inv'))
        containerB = this.inventorySlots;
      if (ItemManager.canEquip(this, containerA[a], b) && ItemManager.canEquip (this, containerB[b], a)) {
        const itemA = containerA[a];
      	containerA[a]=containerB[b];
        containerB[b]=itemA;
        if (!this.updatedValues.items)
          this.updatedValues.items = {};
        this.updatedValues.items[a] = containerA[a];
        this.updatedValues.items[b] = containerB[b];
        //console.log(Object.entries(this.updatedValues.items));
      }
        
    }
  
    die () {
      this.alive = false;
      this.updatedValues.alive=false;
      this.body.body.velocity.x=0;
      this.body.body.velocity.y=0;
      this.scene.newCorpse(this, this.id);
    }
    
    getTargetId () {
    	if (this.target)
    		return this.target.id;
    	return false;
    }
  
    serverTickUpdate() {
      this.hp+=this.hpRegen;
      if (this.hp>this.maxHp)
        this.hp=this.maxHp;
      this.updatedValues.hp=this.hp;
    }
    
    setTarget(id) {
      if (this.attacking && ((this.target && this.target.id != id) || !id)) //Turn off attack if switching target or target is false
          this.toggleAttacking();

    	if (!id)
    		this.target=false;
    	if (this.scene.npcs[id]) 
    		this.target=this.scene.npcs[id];
    	else if (this.scene.players[id]) {
    		this.target=this.scene.players[id];
        }
      else if (this.scene.corpses[id]) {
        this.target=this.scene.corpses[id];
      }
    	this.updatedValues.target=this.getTargetId();
    }
  
    toggleAttacking () {
      if (this.attacking && !this.target) {
      	console.log('Need a target to attack');
        return;
      }
      if (this.attacking && this.target.id === this.id) {
       	console.log('Cannot attack yourself');
        return;
      }
      //Check if target is a corpse
      this.attacking = !this.attacking;
      this.updatedValues.attacking=this.attacking;

    }
  
  	update (delta) {
        if (!this.alive)
          return
        
      	this.updateMovement(delta);
      if (this.angle<0)
          this.angle+=360;
        if (this.angle>360)
          this.angle-=360;
      	this.updateCombat(delta);
      	
      	
    }
    
  	updateCombat(delta) {
      const deltaFactor = delta/300;

      if (!this.primaryAttackReady) {
        this.primaryAttackTimer-=deltaFactor;
        if (this.primaryAttackTimer < 0)
          this.primaryAttackReady = true;
      }
      else if (this.attacking && this.target) {
        this.primaryAttackTimer+=this.delay;
        this.performPrimaryAttack();
        this.primaryAttackReady = false;
      }
      
    }
    
    //Returns the columns and row index, move this to map
    getMapCell() {
    	const col = Math.floor(this.x/this.scene.map.cellWidth);
    	const row = Math.floor(this.y/this.scene.map.cellHeight);
    	return {column:col,row:row};
      //console.log(this.scene.map.getCellAtLoc(this.x, this.y));
      	//return this.scene.map.getCellAtLoc(this.x, this.y);
    }
  
  	performPrimaryAttack() {
        if (this.getDistToLoc({x:this.target.x, y:this.target.y}) > this.attackRange) {
      	  //this.scene.emitToPlayer(player.id, 'Target is out of range');
          console.log('Target oor');
          return false;
        }
        const radiansToTarget = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
        const degreesToTarget = Phaser.Math.RadToDeg(radiansToTarget);
        const deltaAngle = Math.abs(Phaser.Math.Angle.ShortestBetween(this.angle, degreesToTarget));
        const angleAcceptance=35;
        if (deltaAngle > angleAcceptance) {
          //this.scene.emitToPlayer(player.id, 'You must face your target');
          console.log('Not facing target');
          return false;
        }
      
        const result = CombatEngine.attack(this, this.target);
      	//console.log("result: "+result);
      	if (result === CombatEngine.ATTACK_RESULT_DIED)
          this.setTarget(false); //set target to false, automatically turns off attack
        return result;
    }
    
    //Returns the distance between the character and the given location
    getDistToLoc(loc) {
        return Math.sqrt(Math.abs(loc.x-this.x)**2+Math.abs(loc.y-this.y)**2);
    }
  
    
  //Returns 1 if character dies, 0 otherwise
  	removeHp(hp, attacker) {
        //Subtract hp
    	this.hp-=hp;
      	this.updatedValues.hp=this.hp;
        //console.log(this.hp);
      
        //Return the result of the attack
        if (hp===0) {
          return CombatEngine.ATTACK_RESULT_MISSED;
        }
        if (this.hp<=0) {
          this.die();
          return CombatEngine.ATTACK_RESULT_DIED;
        }
        return CombatEngine.ATTACK_RESULT_SURVIVED;
    }
  
  	updateMovement(delta) {
      const deltaFactor = delta/10;
      	this.x = this.body.body.x+this.offset;
      	this.y = this.body.body.y+this.offset;
      	//sätt inte updatedValues om den står still, fixa det
      	if (true) {
      		this.updatedValues.x=this.x;
      		this.updatedValues.y=this.y;
      	}
      	if (this.isTurningLeft) 
        	this.angle -= this.turningSpeed*deltaFactor;
      	else if (this.isTurningRight) 
         	this.angle += this.turningSpeed*deltaFactor;
      	if (!Object.keys(this.updatedValues).includes('angle'))
          this.updatedValues.angle = this.angle;
       	
      	if (this.isMovingForward || this.isMovingBackward) {
      	
          	let dist = this.movementSpeed*deltaFactor;
         	if (this.isMovingBackward)
            	dist *= -0.5;
          	const {x, y} = this.getLocationDelta(dist, this.angle);
 			this.body.body.velocity.x = x;
          	this.body.body.velocity.y = y;
        }
    }
  
  	getExportData() {
      return {
        x:this.x,
        y:this.y,
        angle:this.angle,
        sprite_key:this.sprite_key,
        scale:this.scale,
        bodyRadius:this.bodyRadius,
        id:this.id,
        movementSpeed:this.movementSpeed,
        hp:this.hp,
        maxHp:this.maxHp,
        damage:this.damage,
        attackRating:this.attackRating,
        defense:this.defense,
        delay:this.delay,
        target:this.getTargetId(),
        name:this.name,
        tint:this.tint,
        alive:this.alive,
        level:this.level,
        experience:this.experience,
        attacking:this.attacking,
        equipmentSlots:this.equipmentSlots,
        inventorySlots:this.inventorySlots
      };
    }
  
    destroy() {	
    	this.body.destroy();
    }
  
  	//returns the deltaX and deltaY. 
  	getLocationDelta(dist, angle) {
    	const radians = Phaser.Math.DegToRad(angle);
    	const x = dist * Math.cos(radians);
      	const y = dist * Math.sin(radians);
      	return {x:x, y:y};
    }
  	
  	moveForward () {
  		if (this.respawnTime)
  			console.log
    	this.isMovingForward = true;
      	this.isMovingBackward = false;
    }
  
  	moveBackward () {
    	this.isMovingBackward = true; 
      	this.isMovingFoward = false;
    }
  
  	stopMoving () {
     	this.isMovingForward = this.isMovingBackward = false; 
      	this.body.body.setVelocity(0,0);
    }
  
  	stopTurning () {
    	this.isTurningLeft = this.isTurningRight = false; 
    }
  
  	turnLeft () {
    	this.isTurningLeft = true;
      	this.isTurningRight = false;
    }
  
  	turnRight () {
    	this.isTurningRight = true;
      	this.isTurningLeft = false;
    }
}
