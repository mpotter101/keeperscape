import * as THREE from 'three';
import ThreeHelper from '/ThreeHelper.js';

class HashTableEntity {
	constructor ({object, position, size, hashTable}) {
		this.position = position;
		this.size = size;
		this.hashTable = hashTable;
		this.id = ThreeHelper.MakeId();
		this.object = object;
		this.relevantCells = []; // fill with vector2's
	}
	
	SetPosition (position) {
		this.position = position;
		this.UpdateOccupiedCells ();
	}
	
	UpdateRelevantCells () {
		this.relevantCells = this.hashTable.GetRelevantCellsForEntity (this);
		return this.relevantCells
	}
}

// Hash table is currently a 2D projection in a "Top Down" orientation
export class HashTable {
	constructor ({
		startVector2 = new THREE.Vector2(-50, -50),
		endVector2 = new THREE.Vector2(50, 50),
		cellSize = 1
	}) {
		this.startVector2 = startVector2;
		this.endVector2 = endVector2;
		this.cellSize = cellSize;
		this.hashTable = this.CreateHashTable ();
		this.entityCollection = {};
	}
	
	PointIsWithinHashTable (x, y) {
		return (this.hashTable [x] && this.hashTable [x] [y])
	}
	
	GetRelevantCellsForEntity (hashTableEntity) {
		// using size and current position, get which cells we are currently in
		// assume position is in the center of our size
		var radius = hashTableEntity.size * 0.5;
		var centerPoint = new THREE.Vector2 (hashTableEntity.position.x, hashTableEntity.position.z);
		
		// create a relative location that we can use as an index for getting cells
		var relativeCenterPoint = centerPoint.sub (this.startVector2);
		
		var startCell = new THREE.Vector2 (Math.floor (relativeCenterPoint.x - radius), Math.floor (relativeCenterPoint.y - radius));
		var endCell = new THREE.Vector2 (Math.floor (relativeCenterPoint.x + radius), Math.floor (relativeCenterPoint.y + radius));
		
		// Get cells just outside of entity's actual occupied space so we can keep track 
		// of nearby cells
		startCell.x--
		startCell.y--
		
		endCell.x++
		endCell.y++
		
		console.log ('updating cells for entity:', hashTableEntity.id)
		console.log (radius);
		console.log (centerPoint);
		console.log (relativeCenterPoint);
		console.log (startCell, endCell);
		
		return this.GetCellsWithinParameters ({startCell, endCell});
	}
	
	GetCellsWithinParameters ({startCell, endCell}) {
		// Get how many rows and cells we are occupying, min 1 of each
		var rows = Math.max (endCell.x - startCell.x, 1);
		var columns = Math.max (endCell.y - startCell.y, 1);
		
		var occupiedCells = [];
		var rowIndex = 0;
		while (rowIndex < rows) {
			var cellX = startCell.x + rowIndex;
			
			if (this.hashTable [cellX]) {
				var colIndex = 0;
				while (colIndex < columns) {
					var cellY = startCell.y + colIndex;
					
					if (this.PointIsWithinHashTable (cellX, cellY)) {
						occupiedCells.push (new THREE.Vector2(cellX, cellY));
					}
					
					colIndex++
				}
			}
			
			rowIndex++;
		}
		
		// This will return an empty array if you are off the grid
		return occupiedCells;
	}
	
	CreateHashTable () {
		// figure out how many cells we need to create per row and column
		var width = this.endVector2.x - this.startVector2.x;
		var height = this.endVector2.y - this.startVector2.y;
		var rows = Math.ceil (width / this.cellSize);
		var columns = Math.ceil (height / this.cellSize);
		
		var hashTable = [];
		var xIndex = 0;
		while (xIndex < rows) {
			hashTable.push (this.CreateHashRow (columns));
			xIndex++;
		}
		
		return hashTable;
	}
	
	CreateHashRow (columns) {
		var yIndex = 0;
		var row = [];
		while (yIndex < columns) {
			row.push ([]);
			yIndex++;
		}
		
		return row;
	}
	
	RegisterNewHashTableEntity ({position, size, object}) {
		var hashTableEntity = new HashTableEntity ({object, position, size, hashTable: this});
		this.entityCollection [hashTableEntity.id] = hashTableEntity;
		return hashTableEntity;
	}
}

export default class CollisionManager {
	constructor ({
		hashTable = new HashTable({})
	}) {
		this.hashTable = hashTable;
	}
	
	// CheckEntityForCollision
}