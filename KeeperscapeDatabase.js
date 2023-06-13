import { Database } from 'arangojs';

const DB_NAME = 'keeperDB';
const DB_COLLECTIONS_USERS = 'users';

// useing arango v8
// https://arangodb.github.io/arangojs/8.1.0/index.html

export default class KeeperscapeDatabase {
	constructor ({ip, port}) {
		// attempt to create database stuff
		// Already exists errors are a good thing
		this.collections = {};
	}
	
	Boot () {
		return new Promise (async (resolve, reject) => {
			console.log ('Attempting to setup database. Make sure arangod is running.');
			
			if (await this.EnsureArchitecture ()) {
				resolve();
			}
			else {
				console.log ('Failed to setup DB')
				reject();
			} 
		})
	}
	
	async EnsureArchitecture () {
		try {
			this.database = await new Database({databaseName: DB_NAME});
			this.collections.users = await this.database.collection (DB_COLLECTIONS_USERS);
		}
		catch (err) {
			console.log (err);
			return false;
		}
		
		return true;
	}
}