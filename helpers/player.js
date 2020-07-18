import Character from './character';
import CombatEngine from './combatEngine';
import ExpManager from './expManager';

export default class Player extends Character {
	constructor (args) {
		super(args)
		this.experience=args.experience ||0;
	}

	performPrimaryAttack() {
		const target=this.target;
		const result = super.performPrimaryAttack();
		if (result===CombatEngine.ATTACK_RESULT_DIED)
			this.getExpFromTarget(target);
	}

	getExpFromTarget(target) {
		const exp = ExpManager.getExpForPlayerFromTarget(this,target);
		this.experience+=exp;
		this.updatedValues.experience=this.experience;
		
		if (this.experience >= ExpManager.expNeededForLevel(this.level+1))
			this.levelUp();
	}
	
	levelUp() {
		this.level+=1;
		this.updatedValues.level=this.level;
		console.log(`Congratulations!
You are now level ${this.level}`);
	}

}

