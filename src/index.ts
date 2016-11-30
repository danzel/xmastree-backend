import bodyParser = require('body-parser');
import cors = require('cors');
import documentdb = require('documentdb');
import express = require('express');
import fs = require('fs');
import session = require('express-session');
import DocumentDBSession = require('documentdb-session');

import { initializeDb, Db } from './dbInitializer';
import { HttpServer } from './httpServer';
import { DecorationsController, StatusController } from './controllers'
import { DecorationRepository, UserRepository } from './repositories'
import { ConfigFile } from './interfaces'

const DocumentDBStore = DocumentDBSession(session);



let db: Db
function addExpressMiddleware(app: express.Express) {

	app.use(cors());
	/*app.use(cors({
		origin: [
			'https://xmastree.io',
			'https://www.xmastree.io'
		]
	}));*/

	app.use(bodyParser.json());

	let userRepository = new UserRepository(db.client, db.database, db.collection);
	let decorationRepository = new DecorationRepository(db.client, db.database, db.collection);

	new StatusController(app, userRepository);
	new DecorationsController(app, userRepository, decorationRepository);
	/*app.get('/cookietest', (req, res) => {
		res.json(req.session);
		res.end();
	})*/

}

let config = <ConfigFile>JSON.parse(fs.readFileSync('./config.json', 'utf8'));

if (config.documentDbSslWorkaround) {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

console.log('Initializing Db');
initializeDb(config.documentDbHost, { masterKey: config.documentDbAuthMasterKey }, config.documentDbDatabase, config.documentDbCollection).then(gotDb => {
	db = gotDb;

	console.log('Starting HttpServer');
	let server = new HttpServer({
		httpPort: config.httpPort,

		addExpressMiddleware,

		sessionSecret: 'wkersfhkdxfhi8yw4thuawehjedyiertskhawrkhuawet',
		sessionStore: new DocumentDBStore({
			host: config.documentDbHost,
			key: config.documentDbAuthMasterKey,
			database: config.documentDbDatabase,
			collection: config.documentDbCollection,
			ttl: 7 * 24 * 60 * 60
		}),

		facebookClientID: config.facebookClientID,
		facebookClientSecret: config.facebookClientSecret,

		googleClientID: config.googleClientID,
		googleClientSecret: config.googleClientSecret,

		twitterConsumerKey: config.twitterConsumerKey,
		twitterConsumerSecret: config.twitterConsumerSecret
	});
});
