import * as fs from 'fs';
import path from 'path';

export default class KeeperscapeTemplater {
	static GetFileTextAsync({filePath}) {
		return new Promise( (resolve) => {
			fs.readFile(
				filePath,
				'utf8',
				(error, data) => {
					resolve (data);
				})
		});
	}
	
	static async GetPage (filePath) {
		return await KeeperscapeTemplater.GetFileTextAsync ({filePath});
	}
	
	static GetFilledOutPage ({data, page}) {
		var p = page;
		Object.keys (data).forEach (key => {
			var value = data [key];
			p = p.replaceAll (key, value);
		})
		return p;
	}
	
	static async GetCompiledPage ({userSession, htmlPageFilePath, templateFilePath, navbarFilePath, footerFilePath, tabTitle}) {
		// Get the template
		var template = await KeeperscapeTemplater.GetFileTextAsync ({filePath: templateFilePath});
		// Get either the logged in or logged out navbar based on session
		var navbar = await KeeperscapeTemplater.GetFileTextAsync ({filePath: navbarFilePath});
		// Get the footer
		var footer = await KeeperscapeTemplater.GetFileTextAsync ({filePath: footerFilePath});
		// Get the page indicated by the parameter
		var pageContent = await KeeperscapeTemplater.GetFileTextAsync ({filePath: htmlPageFilePath});
		
		var data = {
			"{{TITLE}}": tabTitle,
			"{{NAVBAR}}": navbar,
			"{{BODY}}": pageContent,
			"{{FOOTER}}": footer
		}
		
		if (userSession) { data ["{{USERNAME}}"] = userSession.username; }
		
		// Combine and return them
		var page = KeeperscapeTemplater.GetFilledOutPage ({data, page: template });
		
		return page;
	}
}