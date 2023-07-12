import path from 'path';
import KeeperscapeTemplater from './KeeperscapeTemplater.js';

export default class KeeperscapeRouter {
	constructor ({directory, app}) {
		this.directory = directory;
		this.AddRoutesToApp (app);
	}
	
	async SendPage ({req, res, localHtmlPageFilePath, tabTitle}) {
		// TODO: Replace condition with a check for an active session
		var hasUser = req.session.user && Object.keys (req.session.user).length;
		var navbarFileName = hasUser ? 'logged-in-navbar.html' : 'logged-out-navbar.html';
		
		res.send(await KeeperscapeTemplater.GetCompiledPage ({
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
		
		app.route ('/login')
			.get ( (req, res) => { this.SendPage ({req, res, localHtmlPageFilePath: '/html/login-register.html', tabTitle: 'Login'}); } );
		
		app.route ('/register')
			.get ( (req, res) => { res.redirect ('/login'); } );
		
		app.route ('/rebar')
			.get ( (req, res) => { this.SendPage ({req, res, localHtmlPageFilePath: '/html/level-editor.html', tabTitle: 'REBAR'}); } );
		
		app.route ('/toxicbarrel')
			.get ( (req, res) => { this.SendPage ({req, res, localHtmlPageFilePath: '/html/character-editor.html', tabTitle: 'TOXIC BARREL'}); } );
		
		app.route ('/constructomancer')
			.get ( (req, res) => { this.SendPage ({req, res, localHtmlPageFilePath: '/html/prop-editor.html', tabTitle: 'CONSTRUCTOMANCER'}); } );
		
		app.route ('/resurface')
			.get ( (req, res) => { this.SendPage ({req, res, localHtmlPageFilePath: '/html/surface-editor.html', tabTitle: 'RESURFACE'}); } );
		
		app.route ('/runt')
			.get ( (req, res) => { this.SendPage ({req, res, localHtmlPageFilePath: '/html/rockit-runt.html', tabTitle: 'Rock it Runt!'}); } );
	}
}