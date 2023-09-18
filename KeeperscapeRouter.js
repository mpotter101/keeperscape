import path from 'path';
import KeeperscapeTemplater from './KeeperscapeTemplater.js';

export default class KeeperscapeRouter {
	constructor ({directory, app, kDatabase}) {
		this.directory = directory;
		this.AddRoutesToApp (app);
		this.kDatabase = kDatabase;
	}
	
	GetNavbarFile (req) {
		var hasUser = req.session.user && Object.keys (req.session.user).length;
		return hasUser ? 'logged-in-navbar.html' : 'logged-out-navbar.html';
	}
	
	async LoadAndSendPage ({req, res, localHtmlPageFilePath, tabTitle}) {
		var page = await KeeperscapeTemplater.GetFileTextAsync (
			{ filePath: path.join (this.directory, localHtmlPageFilePath) }
		);
		
		this.SendPage ({req, res, page, tabTitle});
	}
	
	async SendPage({req, res, page, tabTitle}) {
		var content = await KeeperscapeTemplater.CompilePage ({
			userSession: req.session.user,
			page,
			templateFilePath: path.join (this.directory, '/html/partial/template.html'),
			navbarFilePath: path.join (this.directory, '/html/partial/' + this.GetNavbarFile (req)), 
			footerFilePath: path.join (this.directory, '/html/partial/footer-bar.html'),
			tabTitle	
		});
		
		res.send(content);
	}
	
	async SendProfile (req, res) {
		var username = req.params.username;
		var user = await this.kDatabase.GetUserByUsername (username);

		if (user) {
			var characters = await this.kDatabase.GetCharactersByOwner (user);
			var page = await KeeperscapeTemplater.GetPage (path.join (this.directory, '/html/profile.html'));
			page = KeeperscapeTemplater.GetFilledOutPage ({ 
				data: {
					'{{PROFILE_CHARACTERS}}': JSON.stringify (characters),
					'{{PROFILE_DISPLAY_NAME}}': user.displayName,
					'{{PROFILE_PROFILE_PICTURE}}': user.avatar
				}, 
				page
			});
			await this.SendPage ({req, res, page, tabTitle: user.displayName + '\'s Profile'});
			return;
		}
		
		await this.LoadAndSendPage ({
			req, res,
			localHtmlPageFilePath: '/html/profile-404.html', 
			tabTitle: username + '\'s Profile'
		});
	}	
	
	AddRoutesToApp (app) {
		app.route ('/').get ( 
			(req, res) => { 
				this.LoadAndSendPage ({req, res, localHtmlPageFilePath: '/html/index.html', tabTitle: 'Keeperscape'}); 
			});
		
		app.route ('/logout')
			.get ( (req, res) => { req.session.user = null; res.redirect ('/'); } );
		
		app.route ('/login').get ( 
			(req, res) => { 
				this.LoadAndSendPage ({req, res, localHtmlPageFilePath: '/html/login-register.html', tabTitle: 'Login'}); 
			});
		
		app.route ('/register').get (
			(req, res) => { res.redirect ('/login'); } );
		
		app.route ('/tech-sandbox').get ( 
			(req, res) => { 
				this.LoadAndSendPage ({req, res, localHtmlPageFilePath: '/html/tech-sandbox.html', tabTitle: 'Tech Sandbox'}); 
			});
		
		app.route ('/incarnation').get ( 
			(req, res) => { 
				this.LoadAndSendPage ({req, res, localHtmlPageFilePath: '/html/incarnation.html', tabTitle: 'Incarnation'}); 
			});
		
		app.route ('/incarnation/character/:characterId').get ( 
			(req, res) => {
				this.LoadAndSendPage ({req, res, localHtmlPageFilePath: '/html/incarnation.html', tabTitle: 'Incarnation'}); 
			});
		
		app.route ('/profile/:username').get ( (req, res) => { this.SendProfile (req, res) } );
		
	}
}