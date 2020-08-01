import NPC from '../helpers/npc';
import Player from '../helpers/player';
import Map from '../helpers/map';
import Corpse from '../helpers/corpse';

const maxLootingDistance = 40;

export default class Game extends Phaser.Scene {
	constructor() {
		super({
			key: 'Game'
		});
		
		//How often the server sends updates to the clients
		this.updateInterval = 50;
		this.updateTimer = this.updateInterval;
        this.tickInterval = 4000;
        this.tickTimer=this.tickInterval;
	}

	preload() {
	}

	create() {
        this.fpsCounter=0;
        this.fpsDelta=0;
		//Store npcs with key: id
		this.npcs = {}
		//Store pcs with key: socket.id, change to name later
		this.players = {}
      	this.corpses = {};
		this.obstacles = this.physics.add.staticGroup();
		this.physicsChars= this.physics.add.group();
		
		this.physics.add.collider(this.physicsChars,this.obstacles)
		
		let self = this;
		this.map = Map.defaultMap();
		this.map.getBodies(this,this.obstacles);
		
      
      	this.loadNpcs();
      
		io.on('connection', function (socket) {
			console.log('a user connected');
            
          	//Set up the player and pass info on all players to the new socket
			let player = new Player({
			scene:self, 
			x:250, 
			y:150, 
			sprite_key:'arrow', 
			scale:0.05, 
			angle:0, 
			id:socket.id,
			maxHp:100,
			damage:34,
      movementSpeed:40,
			attackRating:8,
			defense:5,
			delay:10,
			//name:'SomeGuy',
			tint:'#000000',
			bodyRadius:6,
            equipmentSlots:{
              chest:false,
              legs:false,
              main:'sword'
            }
			});
          	
			self.physicsChars.add(player.body);
          	
          	self.players[socket.id] = player;
          	
          	const characterData={}
          	
          	for (const [_, pl] of Object.entries(self.players)) {
              characterData[pl.id] = pl.getExportData();
          	}
          	for (const [_, npc] of Object.entries(self.npcs)) {
              characterData[npc.id] = npc.getExportData();
            }
            
          	
          	const loadData={
          	playerId:player.id, characters:characterData, map:self.map.mapData, mapWidth:self.map.width, mapHeight:self.map.height
          	};
          	
          	socket.emit('load', loadData);
          	
          	socket.broadcast.emit('newCharacter', loadData.characters[player.id]);
          
            
          	//Pass along movement controls to player object
          	socket.on('moveForward', function() {
              	self.players[socket.id].moveForward();
            });
          	socket.on('moveBackward', function() {
            	self.players[socket.id].moveBackward();
            }); 
         	socket.on('turnLeft', function() {
            	self.players[socket.id].turnLeft();
            });
          	socket.on('turnRight', function() {
            	self.players[socket.id].turnRight();
            });
          	socket.on('stopMoving', function() {
            	self.players[socket.id].stopMoving();
            });
          	socket.on('stopTurning', function() {
            	self.players[socket.id].stopTurning();
            });
          	
          	//Other player actions
          	socket.on('setTarget', function(id) {
              	self.players[socket.id].setTarget(id);
            });
          
            socket.on('toggleAttacking', function() {
                self.players[socket.id].toggleAttacking();
            });
          
          	socket.on('proposeItemSwitch', function(data) {
                //console.log('Switch '+data.playerId + ' slot: ' +data.a +' and '+data.b);
              	self.players[data.playerId].switchItemSlots(data.a, data.b);
			});
			
			socket.on('requestCorpseLooting',function (data) {
				if (self.corpses[data.corpseId]) {
					//Check for distance, no other looters and loot rights
					if (!self.corpses[data.corpseId].lootRights.includes(data.playerId)) {
						console.log(self.players[data.playerId].name, 'does not have the loot rights for looting ',self.corpses[data.corpseId].name);
						socket.emit('message', 'You do not have the rights to loot that corpse');
						return;
					}
					
					if (self.corpses[data.corpseId].playerLooting) {
						console.log('Corpse is already being looted');
						socket.emit('message','Corpse is already being looted');
						return;
					}

					const distToCorpse = Math.sqrt(Math.pow(Math.abs(self.players[data.playerId].x-self.corpses[data.corpseId].x),2)+Math.pow(Math.abs(self.players[data.playerId].y-self.corpses[data.corpseId].y),2));
					if (distToCorpse > maxLootingDistance) {
						console.log('Corpse too far away');
						socket.emit('message', 'Corpse is too far away');
						return;
					}

					socket.emit('lootCorpse', {corpseId:data.corpseId, items:self.corpses[data.corpseId].items})
				}
			});
			socket.on('requestToLootItemAtSlot', function (data) {

				//Check if player is looting corpse
				
				
				//Check if player has room in inventory
				let firstOpenSlot = false;
				for (const [slot, item] of Object.entries(self.players[data.playerId].inventorySlots)) {
					if (!firstOpenSlot && !item)
						firstOpenSlot = slot;
				}
				if (firstOpenSlot) {
					const itemIndex = Number(data.slot.substring(6))-1;
					//console.log("itemIndex",itemIndex);
					const item = self.corpses[data.corpseId].items[itemIndex];
					self.corpses[data.corpseId].items.splice(itemIndex,1);
					self.players[data.playerId].setItemAtSlot(item, firstOpenSlot);
					socket.emit('updateCorpseItems', {corpseId:data.corpseId, items:self.corpses[data.corpseId].items});
				}
        	});
          	
          	//When a user disconnects, destroy and remove the player and pass the information along to the clients.
          	socket.on('disconnect', function () {
                console.log('user disconnected');
                io.emit('removePlayer', socket.id);
				if (self.players[socket.id]) {
					self.players[socket.id].destroy();
					delete self.players[socket.id];
					
				}
			});
			
		});
		
	}

	update(time, delta) {
        
      	//UNCOMMENT TO SHOW SERVER FPS IN CONSOLE
      	/*
      	//Calculate and display fps
        this.fpsCounter+=1;
        this.fpsDelta+= delta;
        if (this.fpsCounter>100) {
          console.log('fps: '+(1000*100/this.fpsDelta));
          this.fpsCounter = this.fpsDelta = 0;
        } 
      	*/
      
      
        //Countdown to next server tick
        this.tickTimer-=delta;
        if (this.tickTimer<0) {
			this.tickTimer+=this.tickInterval;
			this.serverTick();
		}
      
		//Countdown to next update
		//this.updateTimer-=delta;
		//if (this.updateTimer<0) {
		//	this.updateTimer+=this.updateInterval;
			this.updateClients();
		//}
		
		
		for (const [_, player] of Object.entries(this.players)) {
  			player.update(delta);
		}
      	for (const[_, npc] of Object.entries(this.npcs)) {
         	npc.update(delta); 
		}
		for (const[_, corpse] of Object.entries(this.corpses)) {
			corpse.update(delta);
		}
	}
  
    serverTick() {
      for (const [_, player] of Object.entries(this.players)) {
  			player.serverTickUpdate();
		}
      	for (const[_, npc] of Object.entries(this.npcs)) {
         	npc.serverTickUpdate(); 
        }
    }
	
	updateClients() {
		//Save all the info on characters that should be updated in the client
      	const characterUpdate = {}
		for (const [id, pl] of Object.entries(this.players)) {
          	characterUpdate[id] = pl.updatedValues;
          	pl.updatedValues = {};
        }
      	for (const[id, ch] of Object.entries(this.npcs)) {
          	characterUpdate[id] = ch.updatedValues;
          	ch.updatedValues = {};
        }

  		io.emit('updateCharacters',characterUpdate);
	}
  
  characterRespawned(id) {
  	io.emit('characterRespawned', id);
  }
  
  newCorpse(character, lootRights) {
	const corpse = Corpse.fromCharacterWithLootRights(this,character,lootRights);
	this.corpses[corpse.id] = corpse;
  	io.emit('newCorpse', {x:corpse.x,y:corpse.y,name:corpse.name,id:corpse.id,spriteKey:corpse.spriteKey,items:corpse.items});
  }

  removeCorpse(id) {
	  delete this.corpses[id];
	  io.emit('removeCorpse', id);
  }
  
  loadNpcs() {
   	const npc = new NPC({
			scene:this, 
			x:250, 
			y:150, 
			sprite_key:'redArrow', 
			scale:0.02, 
			angle:0, 
			maxHp:5,
			damage:5,
			attackRating:8,
			defense:5,
			delay:10,
			name:'Bo-Göran',
			tint:'#000000',
			bodyRadius:6,
      respawnTime:2,
	  level:5,
	  equipmentSlots:{
		  chest:false,
		  legs:false,
		  main:'sword'
	  }
      //physicsGroup:this.physicsChars
	});
	console.log(npc.equipmentSlots);
    this.physicsChars.add(npc.body);
    this.npcs[npc.id]=npc;
  }
	
}
