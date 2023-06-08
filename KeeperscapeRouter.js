import * as fs from 'fs';
import path from 'path';

export default class KeeperscapeRouter {
	constructor ({directory, app}) {
		this.directory = directory;
		
		app.route ('/')
			.get ( (req, res) => { this.SendPage (req, res, '/html/index.html', 'Beholder Online'); } );
		
		app.route ('/login')
			.get ( (req, res) => { this.SendPage (req, res, '/html/login-register.html', 'Login'); } );
		
		app.route ('/register')
			.get ( (req, res) => { res.redirect ('/login'); } );
		
		app.route ('/rebar')
			.get ( (req, res) => { this.SendPage (req, res, '/html/level-editor.html', 'REBAR'); } );
		
		app.route ('/toxicbarrel')
			.get ( (req, res) => { this.SendPage (req, res, '/html/character-editor.html', 'TOXIC BARREL'); } );
		
		app.route ('/constructomancer')
			.get ( (req, res) => { this.SendPage (req, res, '/html/prop-editor.html', 'CONSTRUCTOMANCER'); } );
		
		app.route ('/resurface')
			.get ( (req, res) => { this.SendPage (req, res, '/html/surface-editor.html', 'RESURFACE'); } );
		
	}
		
	GetFileTextAsync({filePath}) {
		return new Promise( (resolve) => {
			fs.readFile(
				filePath,
				'utf8',
				(error, data) => {
					resolve (data);
				})
		});
		
	}
	
	async GetCompiledPage (localFilePath, tabTitle) {
		// Get the template
		var template = await this.GetFileTextAsync ({filePath: path.join (this.directory, '/html/partial/template.html')});
		// Get either the logged in or logged out navbar based on session
		var navbarFileName = false ? 'logged-in-navbar.html' : 'logged-out-navbar.html';
		var navbar = await this.GetFileTextAsync ({filePath: path.join (this.directory, '/html/partial/' + navbarFileName)});
		// Get the footer
		var footer = await this.GetFileTextAsync ({filePath: path.join (this.directory, '/html/partial/footer-bar.html')});
		// Get the page indicated by the parameter
		var pageContent = await this.GetFileTextAsync ({filePath: path.join (this.directory, localFilePath)});
		
		// Combine and return them
		return template.replace ("{{TITLE}}", tabTitle)
			.replace ("{{NAVBAR}}", navbar)
			.replace ("{{BODY}}", pageContent)
			.replace ("{{FOOTER}}", footer);
	}
	
	async SendPage(req, res, localFilePath, tabTitle) {
		// Send it
		res.send(await this.GetCompiledPage (localFilePath, tabTitle));
	}
}