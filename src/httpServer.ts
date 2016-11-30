import express = require('express');
import http = require('http');
import https = require('https');
import session = require('express-session');
import DocumentDBSession = require('documentdb-session');

import passport = require('passport');
import passportFacebook = require('passport-facebook');
import passportGoogle = require('passport-google-oauth');
import passportTwitter = require('passport-twitter');

import {PassportUser} from './interfaces';

interface HttpServerConfig {
	httpPort: number;

	addExpressMiddleware: (express: express.Express) => void;

	sessionSecret: string;
	sessionStore: session.Store;

	twitterConsumerKey: string;
	twitterConsumerSecret: string;

	googleClientID: string;
	googleClientSecret: string;

	facebookClientID: string;
	facebookClientSecret: string;
}

export class HttpServer {
	app: express.Express;
	httpServer: http.Server | https.Server;

	constructor(private config: HttpServerConfig) {
		this.app = express();

		this.configurePassport();

		config.addExpressMiddleware(this.app);

		this.startHttpServer();
	}

	private startHttpServer() {
		console.log('starting http');
		this.httpServer = http.createServer(this.app);
		this.httpServer.listen(this.config.httpPort);
	}

	private configurePassport(): void {
		this.app.use(session({
			store: this.config.sessionStore,
			secret: this.config.sessionSecret,
			resave: true,
			saveUninitialized: false,
			cookie: {
				maxAge: 60 * 24 * 60 * 60 * 1000 //60 days?
			}
		}));
		this.app.use(passport.initialize());
		this.app.use(passport.session());

		passport.serializeUser(function (user, done) {
			console.log('serializeUser');
			done(null, user.provider + "|" + user.providerId);
		});

		passport.deserializeUser(function (id: string, done: (error: any, user: any) => void) {
			console.log('deserializeUser');
			let split = id.indexOf('|');
			done(null, { provider: id.substr(0, split), providerId: id.substr(split + 1) });
		});

		//Twitter
		passport.use(new passportTwitter.Strategy({
			consumerKey: this.config.twitterConsumerKey,
			consumerSecret: this.config.twitterConsumerSecret,
			callbackURL: '/auth/twitter/callback'
		}, (token: string, tokenSecret: string, profile: passport.Profile, done: (error: any, user?: any) => void) => {
			done(null, { provider: profile.provider, providerId: profile.id });
		}));
		this.app.get('/auth/twitter', passport.authenticate('twitter'));
		this.createAuthCallback('/auth/twitter/callback', 'twitter');

		//Google
		passport.use(new passportGoogle.OAuth2Strategy({
			clientID: this.config.googleClientID,
			clientSecret: this.config.googleClientSecret,
			callbackURL: '/auth/google/callback'
		}, (token: string, tokenSecret: string, profile: passport.Profile, done: (error: any, user?: any) => void) => {
			done(null, { provider: profile.provider, providerId: profile.id });
		}));
		this.app.get('/auth/google', passport.authenticate('google', { scope: 'profile' }));
		this.createAuthCallback('/auth/google/callback', 'google');

		//Facebook
		passport.use(new passportFacebook.Strategy({
			clientID: this.config.facebookClientID,
			clientSecret: this.config.facebookClientSecret,
			callbackURL: '/auth/facebook/callback'
		}, (token: string, tokenSecret: string, profile: passport.Profile, done: (error: any, user?: any) => void) => {
			done(null, { provider: profile.provider, providerId: profile.id });
		}));
		this.app.get('/auth/facebook', passport.authenticate('facebook'));
		this.createAuthCallback('/auth/facebook/callback', 'facebook');

		this.app.get('/logout', (req, res) => {
			req.logout();
			res.redirect('/');
		});
	}

	//https://github.com/jaredhanson/passport/blob/master/lib/middleware/authenticate.js#L34
	private createAuthCallback(url: string, provider: string): void {
		this.app.get(url,
			passport.authenticate(provider, {
				successRedirect: '/#success',
				failureRedirect: '/#failure'
			}));
		/*this.app.get(url, (req, res, next) => {
			passport.authenticate(provider, (err: Error, user: PassportUser, info: any, status: number) => {
				if (err) { return next(err); }
				if (!user) { return res.redirect('/#failure'); }

				res.redirect('/#success');
			})(req, res, next);
		});*/
	}
}
