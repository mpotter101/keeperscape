import * as THREE from 'three';
import ThreeHelper from '/core/ThreeHelper.js';

class HashTableEntity {
	constructor ({parent, position, radius, hashTable}) {
		this.position = position;
		this.lastPosition = new THREE.Vector3();
		this.oldCell = {x: 0, y: 0};
		this.centerCell = {x: 0, y: 0};
		this.radius = radius;
		this.hashTable = hashTable;
		this.id = ThreeHelper.MakeId();
		this.parent = parent;
		this.relevantCells = []; // fill with vector2's
		
		this.UpdateRelevantCells();
		this.SetPosition (position);
	}
	
	SetPosition (position) {
		this.position = new THREE.Vector3 (position.x, position.y, position.z);
	}
	
	UpdateRelevantCells () {
		this.oldCell = this.centerCell;
		var newCellInfo = this.hashTable.GetRelevantCellsForEntity (this);
		this.centerCell = newCellInfo.centerCell;
		this.relevantCells = newCellInfo.relevantCells;
		this.hashTable.MoveEntityToCell ({entity: this, newCell: this.centerCell, oldCell: this.oldCell});
	}
	
	GetEntitiesInRelevantCells () {
		var entities = [];
		
		this.relevantCells.forEach (cell => {
			var cellEntities = this.hashTable.GetEntitiesInCell (cell)
			cellEntities.forEach (entity => { 
		  		if (entity.id != this.id) {
					entities.push (entity);
				}
			})
		});
		
		return entities;
	}
	
	InSameCell (cell) {
		return cell.x == this.centerCell.x && cell.y == this.centerCell.y
	}
	
	Update (data) {
		if ( data.position && !data.position.equals (this.position)) {
			this.SetPosition (data.position);
		}
		
		if (!this.lastPosition.equals (this.position)) {
			this.UpdateRelevantCells ();
			this.lastPosition = new THREE.Vector3 (this.position);
		}
		
		
	}
}

// Hash table is currently a 2D projection in a "Top Down" orientation
export default class HashTable {
	constructor ({
		startVector2 = new THREE.Vector2(-50, -50),
		endVector2 = new THREE.Vector2(50, 50),
		cellSize = 1
	}) {
		this.startVector2 = startVector2;
		this.endVector2 = endVector2;
		this.cellSize = cellSize;
		this.hashTable = this.CreateHashTable ();
		this.entityCollection = [];
	}
	
	MoveEntityToCell ({entity, newCell, oldCell}) {
		// Don't worry about this if we  have moved off of the grid somehow
		if (this.CellIsWithinHashTable (newCell)) {
			// Check for moving back into the grid
			var entitiesInOldCell = [];
			if (this.CellIsWithinHashTable (oldCell)) {
				entitiesInOldCell = this.hashTable [oldCell.x] [oldCell.y];
			}
			
			var index = entitiesInOldCell.indexOf (entity);

			if (index > -1) {
				entitiesInOldCell.splice (index, 1);
			}

			this.hashTable [newCell.x] [newCell.y].push (entity);
		}
		
	}
	
	CellIsWithinHashTable (cell) {
		return (this.hashTable [cell.x] && this.hashTable [cell.x] [cell.y])
	}
	
	GetEntitiesInCell (cell) {
		return this.hashTable [cell.x] [cell.y];
	}
	
	GetRelevantCellsForEntity (hashTableEntity) {
		// using size and current position, get which cells we are currently in
		// assume position is in the center of our size
		var radius = hashTableEntity.radius >= 1 ? radius : 1; // hash table acts weird with sizes smaller than 1.
		var centerPoint = new THREE.Vector2 (hashTableEntity.position.x, hashTableEntity.position.z);
		
		// create a relative location that we can use as an index for getting cells
		var relativeCenterPoint = centerPoint.sub (this.startVector2);
		
		var centerCell = new THREE.Vector2 (Math.round (relativeCenterPoint.x), Math.round (relativeCenterPoint.y));
		var startCell = new THREE.Vector2 (Math.ceil (centerCell.x - radius), Math.ceil (centerCell.y - radius));
		var endCell = new THREE.Vector2 (Math.ceil (centerCell.x + radius), Math.ceil (centerCell.y + radius));
		
		// Get cells just outside of entity's actual occupied space so we can keep track 
		// of nearby cells
		//startCell.x--
		//startCell.y--
		
		endCell.x++
		endCell.y++
		
		return {
			centerCell: centerCell,
			relevantCells: this.GetCellsWithinParameters ({startCell, endCell})
		};
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
					
					if (this.CellIsWithinHashTable ({x: cellX, y: cellY})) {
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
	
	RegisterNewHashTableEntity ({position, radius, parent}) {
		var hashTableEntity = new HashTableEntity ({parent, position, radius, hashTable: this});
		this.entityCollection.push (Object.assign ( {id: hashTableEntity.id}, hashTableEntity));
		return hashTableEntity;
	}
}