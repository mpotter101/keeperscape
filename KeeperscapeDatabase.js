import { Database } from 'arangojs';

const DB_NAME = 'keeperDB';
const DB_COLLECTIONS_USERS = 'users';

// useing arango v8
// https://arangodb.github.io/arangojs/8.1.0/index.html

export default class KeeperscapeDatabase {
	constructor ({app, ip, port}) {
		// attempt to create database stuff
		// Already exists errors are a good thing
		this.collections = {};
		
		app.route ('/api/v1/register')
			.post (async (req, res) => {
				console.log(req.body);
				var newUserData = req.body;
			
				var cursor = await this.database.query(
					'FOR u IN users FILTER u.username == "' + newUserData.username  + '" OR u.email == "' + newUserData.email + '" RETURN u'
				);
				var results = await cursor.all();
				
				console.log (results);
			
				if (results && results.length) {
					res.send(JSON.stringify({error: { message: 'username or email is already in use.' } }));
					return;
				}
			
				this.collections.users.save ({
					username: newUserData.username,
					email: newUserData.email,
					password: newUserData.password,
					displayName: newUserData.username,
					avatar: '',
				}).then (
					meta => { res.send(JSON.stringify({success: {message: 'Account Created! Please try to login.'} })); },
					err => { res.send(JSON.stringify({error: {message: 'Failed to create account', details: err} })); }
				);
			});
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
			console.log (err.message);
			return false;
		}
		
		// make sure collection exists
		try {
			await this.collections.users.create();	
		}
		catch (err) {}
		
		return true;
	}
}