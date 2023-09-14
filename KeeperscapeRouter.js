import path from 'path';
import KeeperscapeTemplater from './KeeperscapeTemplater.js';

export default class KeeperscapeRouter {
	constructor ({directory, app, kDatabase}) {
		this.directory = directory;
		this.AddRoutesToApp (app);
		this.kDatabase = kDatabase;
	}
	
	async SendPage ({req, res, localHtmlPageFilePath, tabTitle}) {
		var hasUser = req.session.user && Object.keys (req.session.user).length;
		var navbarFileName = hasUser ? 'logged-in-navbar.html' : 'logged-out-navbar.html';
		
		res.send(await KeeperscapeTemplater.GetCompiledPage ({
			userSession: req.session.user,
			htmlPageFilePath: path.join (this.directory, localHtmlPageFilePath), 
			templateFilePath: path.join (this.directory, '/html/partial/template.html'), 
			navbarFilePath: path.join (this.directory, '/html/partial/' + navbarFileName), 
			footerFilePath: path.join (this.directory, '/html/partial/footer-bar.html'),
			tabTitle	
		}));
	}
	
	AddRoutesToApp (app) {
		app.route ('/')
			.get ( (req, res) => { this.SendPage ({req, res, localHtmlPageFilePath: '/html/index.html', tabTitle: 'Beholder Online'}); });
		
		app.route ('/logout')
			.get ( (req, res) => { req.session.user = null; res.redirect ('/'); } );
		
		app.route ('/login')
			.get ( (req, res) => { this.SendPage ({req, res, localHtmlPageFilePath: '/html/login-register.html', tabTitle: 'Login'}); } );
		
		app.route ('/register')
			.get ( (req, res) => { res.redirect ('/login'); } );
		
		app.route ('/tech-sandbox')
			.get ( (req, res) => { this.SendPage ({req, res, localHtmlPageFilePath: '/html/tech-sandbox.html', tabTitle: 'Tech Sandbox'}); } );
		
		app.route ('/incarnation')
			.get ( (req, res) => { this.SendPage ({req, res, localHtmlPageFilePath: '/html/incarnation.html', tabTitle: 'Incarnation'}); } );
		
		app.route ('/profile/:username')
			.get ( async (req, res) => {
				var username = req.params.username;
				var user = await this.kDatabase.GetUserByUsername(username);
			
				if (user) {
					this.SendPage ({req, res, localHtmlPageFilePath: '/html/profile.html', tabTitle: user.displayName + '\'s Profile'});
				}
				else {
					this.SendPage ({req, res, localHtmlPageFilePath: '/html/profile-404.html', tabTitle: username + '\'s Profile'});
				}
			});
		
	}
}