import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import session from 'express-session';

// Work around for __dirname not being useable with experimental modules
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ---

let app = express();

// Setup content that can be accessed on the browser
app.use (express.static('./browser'));
app.use ('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use ('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));
app.use ('three', express.static(path.join(__dirname, 'node_modules/three/build/build/three.module.js')));

// Setup file upload and body data from post requests
app.use (bodyParser.urlencoded ({extended: false }));
app.use (bodyParser.json ({ limit: '1mb' }));
app.use (fileUpload ());

// Session and server secret for auth stuff, TBD
app.use (session ({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))


var ip = '0.0.0.0';
var port = 3000;
var databasePort = 3100; 

import KeeperscapeRouter from './KeeperscapeRouter.js';
var keeperscapeRouter = new KeeperscapeRouter ({app, directory: __dirname});

import KeeperscapeDatabase from './KeeperscapeDatabase.js';
var keeperscapeDatabase = new KeeperscapeDatabase({ip, port: databasePort});
await keeperscapeDatabase.Boot();

let requestHandler = app.listen (
	port,
	ip,
	() => {
		console.log ('Running server at ' + ip + ':' + port);
		console.log ('Running database at localhost:' + databasePort);
	}
)	

