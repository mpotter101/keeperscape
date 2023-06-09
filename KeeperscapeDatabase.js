import { Database } from 'arangojs';

const DB_NAME = 'keeperDB';
const DB_TIMEOUT = 30000;

export default class KeeperscapeDatabase {
	constructor ({ip, port}) {
		// attempt to create database stuff
		// Already exists errors are a good thing
		this.database = new Database();
	}
	
	Boot () {
		return new Promise (async (resolve, reject) => {
			var started = false;
			setTimeout(() => { 
				if (!started) {
					console.log ('Failed to setup DB. Make sure arangoDB is installed.'); 
					reject(false);
				}
			}, DB_TIMEOUT);
			started = await this.EnsureArchitecture ();
			resolve (started);
		})
	}
	
	async EnsureArchitecture () {
		var result = false;
		await this.database.createDatabase (DB_NAME).then(
			() => {result = true; console.log ('db created')},
			(err) => console.error('Failed: ', err)
		);
		
		return result;
	}
	
	HandleAlreadyExistsError () {
		//
	}
}