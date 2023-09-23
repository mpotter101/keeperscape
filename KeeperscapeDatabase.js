import { Database } from 'arangojs';

const DB_NAME = 'keeperDB';
const DB_COLLECTIONS_USERS = 'users';
const DB_COLLECTIONS_CHARACTERS = 'characters';

// useing arango v8
// https://arangodb.github.io/arangojs/8.1.0/index.html

export default class KeeperscapeDatabase {
	constructor ({app, ip, port}) {
		// attempt to create database stuff
		// Already exists errors are a good thing
		this.collections = {};
		this.AddRoutes (app);
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
	
	async ExecuteQuery (query) {
		try {
			var cursor = await this.database.query(query);
			var results = await cursor.all();	
			return results;
		}
		catch (err) {
			console.log (err);
		}
		
		return [];
	}
	
	async GetUserByUsername (username) {
		var query = [
			'FOR u IN ' + DB_COLLECTIONS_USERS,
			'	FILTER u.username == "' + username + '"',
			'	LIMIT 1',
			'	RETURN u'
		].join ('\n');
		var users = await this.ExecuteQuery (query);
		return users [0];
	}
	
	async GetCharactersByOwner (user) {
		var query = [
			'FOR c IN ' + DB_COLLECTIONS_CHARACTERS,
			'	FILTER c.meta.ownerId == "' + user._id + '"',
			'	RETURN c'
		].join ('\n');
		
		var characters = await this.ExecuteQuery (query);
		return characters;
	}
	
	async AddCharacterToLibrary (user, character) {
		var query = [
			'FOR u IN ' + DB_COLLECTIONS_USERS,
			'	FILTER u.username == "' + user.username + '"',
			'	LIMIT 1',
			'	LET newLibrary = PUSH(u.library, "' + character._id + '")',
			'	UPDATE u WITH { library: newLibrary } IN ' + DB_COLLECTIONS_USERS,
			'		RETURN u',
		].join ('\n');
		
		var results = await this.ExecuteQuery (query);
		
		if (results.length && results [0].username) {
			var updatedUser = await this.GetUserByUsername(user.username);
			return updatedUser;
		}
		
		return results [0];
	}
	
	async RemoveCharacterFromLibrary (user, character) {
		var query = [
			'FOR u IN ' + DB_COLLECTIONS_USERS,
			'	FILTER u.username == "' + user.username + '"',
			'	LIMIT 1',
			'	LET newLibrary = MINUS(u.library, ["' + character._id + '"])',
			'	UPDATE u WITH { library: newLibrary } IN ' + DB_COLLECTIONS_USERS,
			'		RETURN u',
		].join ('\n');
		
		var results = await this.ExecuteQuery (query);
		
		if (results.length && results [0].username) {
			var updatedUser = await this.GetUserByUsername(user.username);
			return updatedUser;
		}
		
		return results [0];
	}
	
	async EnsureArchitecture () {
		try {
			this.database = await new Database({databaseName: DB_NAME});
			this.collections.users = await this.database.collection (DB_COLLECTIONS_USERS);
			this.collections.characters = await this.database.collection (DB_COLLECTIONS_CHARACTERS);
		}
		catch (err) {
			console.log (err.message);
			return false;
		}
		
		// make sure collection exists
		try { await this.collections.users.create(); } catch (err) {}
		try { await this.collections.characters.create(); } catch (err) {}
		
		return true;
	}
	
	UpdateSession (req, updatedUser) {
		req.session.user = Object.assign (req.session.user, updatedUser);
		delete req.session.user.password;
	}
	
	AddRoutes (app) {
		app.route ('/api/v1/profile/:username/character')
			.post (async (req, res) => {
				if (!req.session || !req.session.user || !req.session.user._id) { 
					res.send (JSON.stringify ({error: 'must be logged in to create a character'}));
					return;
				}
							  
				var characterToSave = req.body;
				
				characterToSave.meta = {
					ownerId: req.session.user._id
				}
			
				try {
					var result = await this.collections.characters.save (characterToSave);
					
					if (result._id) {
						var updatedUser = await this.AddCharacterToLibrary(req.session.user, result);
						this.UpdateSession (req, updatedUser);
						res.send (JSON.stringify(
							{
								success: {message: 'Character saved!'}, 
								redirect: '/profile/' + req.session.user.username
							}
						));
					}
					
				}
				catch (err) {
					console.log (err);
					res.send (JSON.stringify({error: err }) );
				}
			});
		
		app.route ('/api/v1/character/:characterKey/library')
			.put (async (req, res) => {
				if (!req.session || !req.session.user || !req.session.user._id) { 
					res.send (JSON.stringify ({error: 'must be logged in to add a character to your library'}));
					return;
				}
			
				var user = req.session.user;
				var character = { _id: DB_COLLECTIONS_CHARACTERS + '/' + req.params.characterKey }
				
				try {
					var updatedUser = await this.AddCharacterToLibrary(user, character);
					this.UpdateSession (req, updatedUser);
					if (updatedUser.library.includes (character._id)) {
						res.send (JSON.stringify ({success: 'character added to library', user: updatedUser}));
					}
					else {
						res.send (JSON.stringify ({error: 'failed to add character to library'}));
					}
				}
				catch (err) {
					res.send (JSON.stringify ({error: err}))
				}
			})
			.delete (async (req, res) => {
				if (!req.session || !req.session.user || !req.session.user._id) { 
					res.send (JSON.stringify ({error: 'must be logged in to remove a character to your library'}));
					return;
				}
			
				var user = req.session.user;
				var character = { _id: DB_COLLECTIONS_CHARACTERS + '/' + req.params.characterKey }
				
				try {
					var updatedUser = await this.RemoveCharacterFromLibrary(user, character);
					this.UpdateSession (req, updatedUser);
					if (!updatedUser.library.includes (character._id)) {
						res.send (JSON.stringify ({success: 'character removed to library', user: updatedUser}));
					}
					else {
						res.send (JSON.stringify ({error: 'failed to add character to library'}));
					}
				}
				catch (err) {
					res.send (JSON.stringify ({error: err}))
				}
			})
		
		app.route ('/api/v1/register')
			.post (async (req, res) => {
				var newUserData = req.body;
			
				if (!newUserData) {
					res.send (JSON.stringify({error: { message: 'No data received.' } }));
					return;
				}
			
				var cursor = await this.database.query(
					'FOR u IN users FILTER u.username == "' + newUserData.username  + '" OR u.email == "' + newUserData.email + '" RETURN u'
				);
				var results = await cursor.all();
			
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
					library: [],
				}).then (
					meta => { res.send(JSON.stringify({success: {message: 'Account Created! Please try to login.'} })); },
					err => { res.send(JSON.stringify({error: {message: 'Failed to create account', details: err} })); }
				);
			});
		
		app.route ('/api/v1/login')
			.post (async (req, res) => {
				var user = req.body;
			
				if (!user) {
					res.status (400);
					res.send (JSON.stringify({error: { message: 'No data received.' } }));
					return;
				}
			
				var query = [
					'FOR u IN users',
						'FILTER LOWER(u.username) == LOWER("' + user.username + '")',
						'LIMIT 1',
						'return u'
				].join ('\n');
			
				var cursor = await this.database.query(query);
				var results = await cursor.all();
			
				if (results && results.length) {
					var dbUser = results [0];
					
					if (dbUser.password == user.password) {
						req.session.user = {
							username: dbUser.username,
							displayName: dbUser.displayName,
							avatar: dbUser.avatar,
							library: dbUser.library,
							_id: dbUser._id
						}
						res.redirect ('/');
						return;
					}
				}
			
				res.status (400);
				res.send (JSON.stringify({error: { message: 'Username or password are incorrect' } }));
			});
	}
}