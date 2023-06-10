import { Database } from 'arangojs';

const DB_NAME = 'keeperDB';
const DB_TIMEOUT = 30000;
const DB_ALREADY_CREATED = 'duplicate database name';
const DB_COLLECTION_ALREADY_CREATED = 'duplicate collection name';

const DB_COLLECTIONS_USERS = 'users';

const DB_ERR_CONNECTION_REFUSE = 'ECONNREFUSED';

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
			await this.EnsureArchitecture ();
			console.log (DB_NAME, 'database started at: 127.0.0.1:8529');
			resolve ();
		})
	}
	
	async EnsureArchitecture () {
		this.database = new Database({databaseName: DB_NAME});
		this.collections.users = await this.database.collection (DB_COLLECTIONS_USERS);
	}
}