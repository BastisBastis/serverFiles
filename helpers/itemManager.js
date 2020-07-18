import * as ItemDB from '../dbs/itemDB';

export default class ItemManager {
	static canEquip(player,item,slot) {
      	
		//False === no item, which is always allowed
		if (!item)
			return true;
		
		if (!ItemDB.items[item]) {
			console.log('ItemDB: Item',item,'does not exist!');
			return false;
		}
		
		//Player can equip item in slot
		if (ItemDB.items[item].slots.includes(slot)) 
			return true;
    
    //Inventory slot, always allowed
    if (slot.startsWith('inv'))
    	return true;
		else
			return false;
	}
	
	static getItem(key) {
		if (!ItemDB.items[key]) {
			console.log('ItemDB: Item',key,'does not exist!');
			return false;
		}
		
		return ItemDB.items[key];
	
	}


}

