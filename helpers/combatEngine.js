import ItemManager from './itemManager';

export default class CombatEngine {
  	static ATTACK_RESULT_SURVIVED = 0;
  	static ATTACK_RESULT_DIED = 1;
  	static ATTACK_RESULT_MISSED = 2
  	
  	static attack(attacker, target) {
  		//Calculate attacker stats for performing a hit
  		let attackerChanceStat=attacker.attackRating+attacker.level*4;
  		
  		//Calculate targets chance to avoid hit
  		let targetAvoidStat=target.defense+target.level*4;
  		
  		//Add armor variables to attackers chance to hit
  		let targetArmor=0;
  		for (const [slot,itemKey] of Object.entries(target.equipmentSlots)) {
  			if (itemKey) {
	  			const item = ItemManager.getItem(itemKey);
	  	  	if (item && item.armor) {
	  	  		targetArmor+=item.armor;
	  	  	}
  	  	}
  	  }
  	  targetAvoidStat+=targetArmor;
  	  
  	  //Calculate total chance to hit
  	  let chanceToHit=attackerChanceStat/(attackerChanceStat+targetAvoidStat);
  	  
  	  //Perform random roll
  	  const hitRoll = Math.random();
			const hit = hitRoll<chanceToHit;
	
  		if (hit) {
  			let damage=attacker.damage;
  			//Use weapon damage if one is equipped
  			if (attacker.equipmentSlots.main) {
  				damage = ItemManager.getItem(attacker.equipmentSlots.main).damage;
  			}
  		
  			//Calculate max and min hit and get a random integer between them
				const maxHit=damage+attacker.level;
		
				const minHit = maxHit*(maxHit/(maxHit+target.defense+target.level+targetArmor))
		
				const hitDamage = Math.floor(minHit+(maxHit-minHit)*Math.random())
				
				//Remove hps from target
				return target.removeHp(hitDamage,attacker);
		
			}
			else
				return target.removeHp(0,attacker);
    	//return target.removeHp(attacker.damage, attacker);
    }
  
}
