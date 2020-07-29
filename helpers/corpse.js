let idCounter = 0;

export default class Corpse {
    constructor ({scene, name, x, y, decayTime, items, lootRights, spriteKey = 'cross'}) {
        this.scene = scene;
        this.name = name;
        this.x = x;
        this.y = y;
        this.lootRights = lootRights;
        this.spriteKey = spriteKey;
      	this.items = items;
        this.decayTime = decayTime || Object.keys(items).length > 0 ? 300 : 5;
        this.decayCountdown = this.decayTime;
        this.id = name+(idCounter++);
        this.playerLooting=false;
    }

    update(delta) {
        this.decayCountdown-=delta/1000;
        if (this.decayCountdown < 0) {
            this.scene.removeCorpse(this.id);
        }
    }

    static fromCharacterWithLootRights(scene, character, lootRights) {
        const items = [];
        for (const [_,item] of Object.entries(character.equipmentSlots))
            if (item)
                items.push(item);
        for (const [_,item] of Object.entries(character.inventorySlots))
            if (item)
                items.push(item);        
        return new Corpse({
            scene: scene,
            name: character.name+"'s corpse",
            x:character.x,
            y:character.y,
            items: items,
            lootRights:lootRights
        }); 
    }

    static fromPlayer(player) {
        return Corpse.fromCharacterWithLootRights(scene,player, [player.id]);
    }

    playerCanLoot(playerId) {
        if (this.lootRights.includes(playerId))
            return true;
        return false;
    }


}
