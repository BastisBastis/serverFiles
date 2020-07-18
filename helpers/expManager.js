import Character from './character';

const expNeededList=[0,0];

let expNeeded=2000;
for (let i = 2;i<11;i++) {
	expNeededList.push(expNeeded+expNeededList[i-1]);
	expNeeded*=1.3;
}
	
const mobExpList=[0];
let mobExp = 200;
for (let i = 1;i<11;i++) {
	mobExpList.push(mobExp);
	mobExp=Math.floor(mobExp*1.2);
}

export default class ExpManager {

	static expNeededForLevel(level) {
		if (level<0 || level >= expNeededList.length) 
			return false;
		return expNeededList[level];
	}
	
	//Returns the amount of exp recieved from killing a NPC of the same level as player
	static getExpFromNPCLevel(level) {
		if (level<1 || level >= mobExpList.length) 
			return false;
		return mobExpList[level];
	}

	static getExpForPlayerFromTarget(player,target) {
		const baseExp = ExpManager.getExpFromNPCLevel(target.level);
		if (baseExp === false) {
			console.log(`ExpManager: Target level (${target.level}) is not valid.`);
			return 0;
		}
		let result = 0;
		
		if (target.level-player.level < -3)
			result =  0;
		else if (target.level-player.level === -3)
			result =  baseExp*0.2;
		else if (target.level-player.level === -2)
			result =  baseExp*0.4;
		else if (target.level-player.level === -1)
			result =  baseExp*0.7;
		else if (target.level-player.level === 0)
			result =  baseExp;
		else if (target.level-player.level === 1)
			result =  baseExp*1.1;
		else if (target.level-player.level === 2)
			result =  baseExp*1.2;
		else if (target.level-player.level > 2)
			result =  baseExp*1.3;
		
		//Else something very weird
		//else console.log('ExpManager: something wrong with player.level or target.level',player.level,target.level);
		
		return Math.floor(result);
		
	}
}
/*
const ta={level:5};
const pl={level:5};
console.log(ExpManager.getExpForPlayerFromTarget(pl,ta)+'/'+(ExpManager.expNeededForLevel(pl.level+1)-ExpManager.expNeededForLevel(pl.level)));
*/

