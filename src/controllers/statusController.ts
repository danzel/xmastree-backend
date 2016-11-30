import express = require('express');

import { PassportUser } from '../interfaces';
import { UserRepository } from '../repositories';

interface StatusResponse {
	authenticated: boolean;

	/** null if not authenticated */
	amountPlaced?: number;
	/** null if not authenticated */
	nextDecoration?: number;
	/** null if not authenticated or never placed one. in JustDate format */
	dateLastPlaced?: number;
}

export class StatusController {
	constructor(app: express.Express, private userRepository: UserRepository) {
		console.log('configuring get /api/status/v1')
		app.get('/api/status/v1', async (req, res) => {
			let user = <PassportUser>req.user;

			if (user) {
				try {
					let userModel = await userRepository.getOrCreateUser(user.provider, user.providerId);

					res.json({
						authenticated: true,
						amountPlaced: userModel.amountPlaced,
						nextDecoration: userModel.nextDecoration,
						dateLastPlaced: userModel.dateLastPlaced
					});
					res.end();
				}
				catch (err) {
					res.statusCode = 503;
					res.end();
				}
			} else {
				res.json({
					authenticated: false
				});
				res.end();
			}
		})
	}
}