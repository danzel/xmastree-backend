import express = require('express');

import {PassportUser} from '../interfaces';
import {UserRepository} from '../repositories';

export class StatusController {
	constructor(app: express.Express, private userRepository: UserRepository) {
		app.get('/api/v1/status', (req, res) => {
			let user = <PassportUser>req.user;

			//TODO
		})
	}
}