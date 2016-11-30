import express = require('express');

import { JustDate, PassportUser } from '../interfaces';
import { DecorationRepository, UserRepository } from '../repositories';

interface AddDecorationRequest {
	x: number;
	y: number;

	/** in JustDate format */
	date: number;
}

interface AddDecorationResponse {
	/** x, y, type */
	decorations: Array<Array<number>>;
}

export class DecorationsController {
	constructor(app: express.Express, private userRepository: UserRepository, private decorationRepository: DecorationRepository) {
		console.log('configuring post /api/decorations/add/v1')
		app.post('/api/decorations/add/v1', async (req, res) => {

			let user = <PassportUser>req.user;

			if (!user) {
				res.statusCode = 401;
				res.statusMessage = 'Not Authenticated';
				res.end();
				return;
			}

			try {

				let userModel = await userRepository.getOrCreateUser(user.provider, user.providerId);

				//Parse the body json
				let x = parseFloat(req.body.x);
				let y = parseFloat(req.body.y);
				let dateNumber = parseInt(req.body.date);

				let when = new JustDate(dateNumber);
				let now = JustDate.now();
				if (!userRepository.userCanPlaceDecoration(userModel, when, now)) {
					res.statusCode = 403;
					res.statusMessage = 'You have already placed a decoration today, come back tomorrow!';
					res.end();
					return;
				}
				await decorationRepository.addDecoration(x, y, userModel.nextDecoration, when, new Date().getTime(), userModel);

				await await userRepository.updateUserHasPlacedDecoration(userModel, when);

				res.json({
					nextDecoration: userModel.nextDecoration
				});
				res.end();
			} catch (err) {
				res.statusCode = 500;
				res.end();
			}
		});

		console.log('configuring get /api/decorations/v1')
		app.get('/api/decorations/v1', async (req, res) => {

			let decorations = await decorationRepository.getAllDecorations();

			res.json({
				decorations: decorations.map(d => [
					d.x,
					d.y,
					d.decorationType
				])
			})
		})
	}
}