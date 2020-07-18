export default class Map {
    constructor(mapData, mapWidth, mapHeight) {
    		this.mapData = mapData;
      		this.cellWidth = mapWidth/mapData.length;
      		this.cellHeight = mapHeight/mapData[0].length;
      		this.width = mapWidth;
      		this.height = mapHeight;
    		if (!mapData || mapData.length < 1 || mapData[0].length <1) {
    			console.log("illegal mapData");
    			return
    		}
				this.columns = mapData.length;
				this.rows=mapData[0].length;
		}
		
	getCellAt(col,row) {
		return this.mapData[col][row];
	}
  
  	getCellAtLoc(x, y) {
      	//console.log({column:Math.floor(x/this.cellWidth), row:Math.floor(y/this.cellHeight)});
    	return {column:Math.floor(x/this.cellWidth), row:Math.floor(y/this.cellHeight)}; 
    }
  	
  	getCenterOfCell(col, row) {
      return {x:this.cellWidth/2+col*this.cellWidth, y:this.cellHeight/2+row*this.cellHeight};
    }
	
	getBodies(scene,physicsGroup) {
      
		//const cellWidth=scene.cameras.main.centerX*2/this.columns;
		//const cellHeight = scene.cameras.main.centerY*2/this.rows;
      	//console.log(cellWidth, cellHeight);
		const bodies = [];
		//console.log("cellWidth: "+cellWidth)
		for (let col = 0; col<this.columns;col++) {
		//console.log(row)
			for (let row = 0; row < this.rows; row++) {
				if (this.getCellAt(col,row)===1) {
					const body = scene.add.rectangle(this.cellWidth/2+this.cellWidth*col, 
                                                     this.cellHeight/2+this.cellHeight* row,
                                                     this.cellWidth,
                                                     this.cellHeight);
					scene.physics.add.existing(body,true);
					if (physicsGroup)
						physicsGroup.add(body);
					bodies.push(body);
				}
			}
		}
		return bodies;
	}
  
	static defaultMap() {
    	let map = [];
	    for (let i = 0; i<10;i++) {
        	map[i]=[];
          	
          	
          	for (let j = 0; j<10; j++) {
              let cell = 0
              if (i === 0 || i === 9 || j === 0 || j === 9) {
                cell = 1;
              }
              map[i][j]=cell;
            }
            
        }
      	map[4][4]=1;
      	map[5][4]=1;
      	map[6][5]=1;
      	//console.log(map);
      	return new Map(map, 1200, 800);
    }
		
}
