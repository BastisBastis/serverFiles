import Map from './map';


function getIndexWithLeastF(list) {
	if (list.length<1)
		console.log('Cannot pass empty list to getIndexWithLeastF');

	/*
	if (!list[0].f)
		console.log(list[0].f+' is not valid for f in getIndexWithLeastF');
		*/
	
  let leastF=list[0].f;
  let leastFIndex=0;
	for (const [i,cell] of Object.entries(list)) {
	  if (cell.f < leastF) {
	  	leastF=cell.f;
	  	leastFIndex=i;
	  }
	}
	return leastFIndex;
}

function getHFromCell(from,target) {
	return Math.sqrt(Math.abs(target.x-from.x)**2+Math.abs(target.y-from.y)**2);
}


export default class Pathfinder {

	static getPathFromToInMap(from,target,map) {
		const closed=[];
		const open=[];
		const startingCell = {x:from.x,y:from.y,f:0,g:0,parent:false};
		open.push(startingCell);
		
		let targetCell=false;
		while(open.length>0) {
			//Pop cell with lowest F from open and store as curCell
			
			const curCell = open.splice(getIndexWithLeastF(open),1)[0];
			
			if (curCell.x===target.x && curCell.y===target.y) {
				targetCell=curCell;
				break;
			}
			//add successors to openList
			for (let i=-1;i<2;i++) {
				const validCellX = curCell.x + i >=0 && curCell.x+i <map.columns;
				//Omit cells invalid x
				if (validCellX) {
					for (let j=-1;j<2;j++) {
						//Omit cells with invalid y or blocked on map
						const validCellY = curCell.y+j >0 && curCell.y+j < map.rows;
						const cellOpen = map.getCellAt(curCell.x+i,curCell.y+j)===0;
						
						let diagonalBlock=false;
						
						if (i+j=== -2 && (map.getCellAt(curCell.x-1,curCell.y)!=0 ||map.getCellAt(curCell.x,curCell.y-1)!=0))
							diagonalBlock=true;
						else if (i=== 1 && j===-1 && (map.getCellAt(curCell.x+1,curCell.y)!=0 ||map.getCellAt(curCell.x,curCell.y-1)!=0))
							diagonalBlock=true;
						else if (i=== -1 && j===1 && (map.getCellAt(curCell.x-1,curCell.y)!=0 ||map.getCellAt(curCell.x,curCell.y+1)!=0))
							diagonalBlock=true;
						else if (i+j=== 2 && (map.getCellAt(curCell.x+1,curCell.y)!=0 ||map.getCellAt(curCell.x,curCell.y+1)!=0))
							diagonalBlock=true;
							
						
						const isCurCell= i===0 && j===0;
						
						if (validCellY && cellOpen && !diagonalBlock && !isCurCell) {
							
							let g = curCell.g;
							if (i!=0 && j!=0)
								g+=1.4;
							else
								g+=1;
							
							const h = getHFromCell({x:curCell.x+i,y:curCell.y+j},target);
							
							const f=g+h;
							
							let shouldAddToOpen=true;
							//Set shouldAddToOpen to false if there is an existing path to the same cell with cheaper f
							const findFasterPathToCell  = (cell)=> {
								if (cell.x===curCell.x+i && cell.y===curCell.y+j && cell.f <= f) {
									shouldAddToOpen=false;
								
								}
									
							}
							open.forEach(findFasterPathToCell);
							closed.forEach(findFasterPathToCell);
							
							if (shouldAddToOpen) {
								const newCell = {
								x:curCell.x+i,
								y:curCell.y+j,
								f:f,
								g:g,
								h:h,
								parent:curCell
								//successors:[]
								};
								//curCell.successors.push(newCell);
								open.push(newCell);
								
							}
						}
					}
				}
			}
			closed.push(curCell);
		}
		if (targetCell) {
			const path=[];
			let cell=targetCell;
			let pathString='';
			while (cell.parent) {
				pathString+= `x:${cell.x} y:${cell.y}
				`
				path.unshift({x:cell.x,y:cell.y});
				cell=cell.parent;
			}
			//console.log(pathString);
			return path;
			
		}
		console.log('No path found');
	}
}
