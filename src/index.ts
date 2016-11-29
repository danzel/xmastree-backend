import express = require('express');
import session = require('express-session');
import DocumentDBSession = require('documentdb-session');

import {HttpServer} from './httpServer';

const DocumentDBStore = DocumentDBSession(session);

//TODO: Only for dev
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function addExpressMiddleware(app: express.Express) {
	//todo
	app.get('/test', (req, res) => {
		res.json({
			something: 'lolol',
			abcezas: 123
		});
		res.end();
	});

	app.get('/cookietest', (req, res) => {
		res.json(req.session);
		res.end();
	})
}

let server = new HttpServer({
	httpPort: 3000,

	addExpressMiddleware,

	sessionSecret: 'wkersfhkdxfhi8yw4thuawehjedyiertskhawrkhuawet',
	sessionStore: new DocumentDBStore({
		host: 'https://localhost:8081/',
		key: 'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==',
		ttl: 7 * 24 * 60 * 60
	}),

	facebookClientID: 'todo',
	facebookClientSecret: 'todo',

	googleClientID: 'todo',
	googleClientSecret: 'todo',

	twitterConsumerKey: 'todo',
	twitterConsumerSecret: 'todo'
});