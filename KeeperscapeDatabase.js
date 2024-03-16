import { Database } from 'arangojs';

const DB_NAME = 'keeperDB';
const DB_COLLECTIONS_USERS = 'users';
const DB_COLLECTIONS_SPRITES = 'sprites';

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
	
	async GetSpritesByOwner (user) {
		var query = [
			'FOR c IN ' + DB_COLLECTIONS_SPRITES,
			'	FILTER c.meta.ownerId == "' + user._id + '"',
			'	RETURN c'
		].join ('\n');
		
		var sprites = await this.ExecuteQuery (query);
		return sprites;
	}
	
	async GetSpriteByKey (spriteKey) {
		var query = [
			'FOR c IN ' + DB_COLLECTIONS_SPRITES,
			'	FILTER c._key == "' + spriteKey + '"',
			'	RETURN c'
		].join ('\n');
		
		var sprites = await this.ExecuteQuery (query);
		return sprites [0];
	}
	
	async AddSpriteToLibrary (user, sprite) {
		var query = [
			'FOR u IN ' + DB_COLLECTIONS_USERS,
			'	FILTER u.username == "' + user.username + '"',
			'	LIMIT 1',
			'	LET newLibrary = PUSH(u.library, "' + sprite._id + '")',
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
	
	async RemoveSpriteFromLibrary (user, sprite) {
		var query = [
			'FOR u IN ' + DB_COLLECTIONS_USERS,
			'	FILTER u.username == "' + user.username + '"',
			'	LIMIT 1',
			'	LET newLibrary = MINUS(u.library, ["' + sprite._id + '"])',
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
		}
		catch (err) {
			console.log (err.message);
			return false;
		}
		
		let collectionNames = await this.database.listCollections();
		
		await this.PrepareCollection (collectionNames, DB_COLLECTIONS_USERS);
		await this.PrepareCollection (collectionNames, DB_COLLECTIONS_SPRITES);
		return true;
	}
	
	// Expected data in collectionNamesList
	// https://arangodb.github.io/arangojs/latest/modules/_collection_.html#collectionmetadata
	async PrepareCollection(collectionNamesList, name) {
		// store a collections object
		this.collections [name] = this.database.collection(name);
		
		// check if the collection has been created
		let foundName = false;
		collectionNamesList.forEach ( (collectionMetaData) => {
			if (collectionMetaData.name == name) { foundName = true }
		})
		
		// create it if it hasn't
		if (!foundName) {
			await this.collections [name].create();
		}
	}
	
	UpdateSession (req, updatedUser) {
		req.session.user = Object.assign (req.session.user, updatedUser);
		delete req.session.user.password;
	}
	
	AddRoutes (app) {
		app.route ('/api/v1/profile/:username/sprite')
			.post (async (req, res) => {
				if (!req.session || !req.session.user || !req.session.user._id) { 
					res.send (JSON.stringify ({error: 'must be logged in to create a sprite'}));
					return;
				}
							  
				var spriteToSave = req.body;
				
				spriteToSave.meta = {
					ownerId: req.session.user._id
				}
			
				try {
					var result = await this.collections.sprites.save (spriteToSave);
					
					if (result._id) {
						var updatedUser = await this.AddSpriteToLibrary(req.session.user, result);
						this.UpdateSession (req, updatedUser);
						res.send (JSON.stringify(
							{
								success: {message: 'Sprite saved!'}, 
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
		
		app.route ('/api/v1/sprites/:spriteKey/library')
			.put (async (req, res) => {
				if (!req.session || !req.session.user || !req.session.user._id) { 
					res.send (JSON.stringify ({error: 'must be logged in to add a sprite to your library'}));
					return;
				}
			
				var user = req.session.user;
				var sprite = { _id: DB_COLLECTIONS_SPRITES + '/' + req.params.spriteKey }
				
				try {
					var updatedUser = await this.AddSpriteoLibrary(user, sprite);
					this.UpdateSession (req, updatedUser);
					if (updatedUser.library.includes (sprite._id)) {
						res.send (JSON.stringify ({success: 'sprite added to library', user: updatedUser}));
					}
					else {
						res.send (JSON.stringify ({error: 'failed to add sprite to library'}));
					}
				}
				catch (err) {
					res.send (JSON.stringify ({error: err}))
				}
			})
			.delete (async (req, res) => {
				if (!req.session || !req.session.user || !req.session.user._id) { 
					res.send (JSON.stringify ({error: 'must be logged in to remove a sprite to your library'}));
					return;
				}
			
				var user = req.session.user;
				var sprite = { _id: DB_COLLECTIONS_SPRITES + '/' + req.params.spriteKey }
				
				try {
					var updatedUser = await this.RemoveCharacterFromLibrary(user, sprite);
					this.UpdateSession (req, updatedUser);
					if (!updatedUser.library.includes (sprite._id)) {
						res.send (JSON.stringify ({success: 'sprite removed to library', user: updatedUser}));
					}
					else {
						res.send (JSON.stringify ({error: 'failed to add sprite to library'}));
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