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
	
	static async GetCompiledPage ({htmlPageFilePath, templateFilePath, navbarFilePath, footerFilePath, tabTitle}) {
		// Get the template
		var template = await KeeperscapeTemplater.GetFileTextAsync ({filePath: templateFilePath});
		// Get either the logged in or logged out navbar based on session
		var navbar = await KeeperscapeTemplater.GetFileTextAsync ({filePath: navbarFilePath});
		// Get the footer
		var footer = await KeeperscapeTemplater.GetFileTextAsync ({filePath: footerFilePath});
		// Get the page indicated by the parameter
		var pageContent = await KeeperscapeTemplater.GetFileTextAsync ({filePath: htmlPageFilePath});
		
		// Combine and return them
		return template.replace ("{{TITLE}}", tabTitle)
			.replace ("{{NAVBAR}}", navbar)
			.replace ("{{BODY}}", pageContent)
			.replace ("{{FOOTER}}", footer);
	}
}