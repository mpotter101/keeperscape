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
	
	static async CompilePage ({user, page, templateFilePath, navbarFilePath, footerFilePath, tabTitle}) {
		// Get the template
		var template = await KeeperscapeTemplater.GetFileTextAsync ({filePath: templateFilePath});
		// Get either the logged in or logged out navbar based on session
		var navbar = await KeeperscapeTemplater.GetFileTextAsync ({filePath: navbarFilePath});
		// Get the footer
		var footer = await KeeperscapeTemplater.GetFileTextAsync ({filePath: footerFilePath});
		
		var data = {
			"{{TITLE}}": tabTitle,
			"{{NAVBAR}}": navbar,
			"{{BODY}}": page,
			"{{FOOTER}}": footer
		}
		
		if (user) { data ["{{USER}}"] = JSON.stringify (user); }
		
		// Combine and return them
		var page = KeeperscapeTemplater.GetFilledOutPage ({data, page: template });
		
		return page;
	}
}