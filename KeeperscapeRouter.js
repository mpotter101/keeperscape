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
			user: req.session.user,
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
			var sprites = await this.kDatabase.GetSpritesByOwner (user);
			var page = await KeeperscapeTemplater.GetPage (path.join (this.directory, '/html/profile.html'));
			page = KeeperscapeTemplater.GetFilledOutPage ({ 
				data: {
					'{{PROFILE_SPRITES}}': JSON.stringify (sprites),
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
	
	async SendDashboard (req, res) {
		var username = req.session.user.username;
		var user = await this.kDatabase.GetUserByUsername (username);
		
		var sprites = await this.kDatabase.GetSpritesByOwner (user);
		var page = await KeeperscapeTemplater.GetPage (path.join (this.directory, '/html/dashboard.html'));
		page = KeeperscapeTemplater.GetFilledOutPage ({ 
				data: {
					'{{DASHBOARD_SPRITES}}': JSON.stringify (sprites),
					'{{USERNAME}}': user.username
				}, 
				page
			});
		await this.SendPage ({req, res, page, tabTitle: 'Dashboard'});
		return;
	}
	
	async SendSpriteToIncarnation (req, res) {
		var user = req.session.user;
		var sprite = await this.kDatabase.GetSpriteByKey (req.params.spriteKey);
		
		if (sprite.meta.ownerId != user._id) { res.redirect ('/'); return; }
		
		var page = await KeeperscapeTemplater.GetPage (path.join (this.directory, '/html/incarnation.html'));
		page = KeeperscapeTemplater.GetFilledOutPage ({ 
				data: {
					'{{SPRITE_JSON}}': JSON.stringify (sprite),
				}, 
				page
			});
		await this.SendPage ({req, res, page, tabTitle: 'Incarnation'});
		return;
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
			async (req, res) => { 
				var page = await KeeperscapeTemplater.GetPage (path.join (this.directory, '/html/incarnation.html'));
				page = KeeperscapeTemplater.GetFilledOutPage ({ 
						data: {
							'{{SPRITE_JSON}}': "null",
						}, 
						page
					});
				await this.SendPage ({req, res, page, tabTitle: 'Incarnation'});
			});
		
		app.route ('/incarnation/sprite/:spriteKey').get ( 
			(req, res) => {
				if (!req.session.user) { res.redirect ('/'); return; }
				
				this.SendSpriteToIncarnation (req, res);
			});
		
		app.route ('/profile/:username').get ( (req, res) => { this.SendProfile (req, res) } );
		
		app.route ('/dashboard').get ( (req, res) => {
			if (!req.session.user) { res.redirect ('/'); return; }
			
			this.SendDashboard (req, res);
		})
		
	}
}