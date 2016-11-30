import documentdb = require('documentdb');
import uuid = require('node-uuid');

import { JustDate, UserModel } from '../interfaces';

export class UserRepository {
	constructor(private client: documentdb.DocumentClient, private database: documentdb.DatabaseMeta, private collection: documentdb.CollectionMeta) {
	}

	async getOrCreateUser(provider: string, providerId: string): Promise<UserModel> {
		return new Promise<UserModel>((resolve, reject) => {
			let id = provider + '|' + providerId;

			this.client.queryDocuments(this.collection._self,
				<documentdb.SqlQuerySpec>{
					query: "SELECT * FROM " + this.collection.id + " c WHERE c.type='user' AND c.id=@id",
					parameters: [
						{ name: '@id', value: id }
					]
				}, {}).toArray((err, res) => {
					if (err) {
						reject(err);
					} else {
						if (res.length == 1) {
							resolve(<UserModel><any>res[0]);
						} else {
							let user: UserModel = {
								amountPlaced: 0,
								dateLastPlaced: null,
								id,
								nextDecoration: 1, //TODO
								provider,
								providerId,
								type: 'user',
								userUuid: uuid.v4()
							};
							(<any>this.client).upsertDocument(this.collection._self, user, {}, (err: Error, res: any) => {
								if (err) {
									reject(err);
								} else {
									resolve(user);
								}
							})
						}
					}
				});
		});
	}

	async updateUserHasPlacedDecoration(user: UserModel, when: JustDate): Promise<void> {
		return new Promise<void>((resolve, reject) => {

			let docLink = 'dbs/' + this.database.id + '/colls/' + this.collection.id + '/docs/' + user.id;

			user.amountPlaced++;
			user.dateLastPlaced = when.value;
			user.nextDecoration++; //TODO: nextDecoration

			this.client.replaceDocument(docLink, user, {}, (err, res) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			})
		})
	}

	userCanPlaceDecoration(user: UserModel, when: JustDate, now: JustDate): boolean {

		//Check when vs now
		const dayInMilliseconds = 24 * 60 * 60 * 1000;
		let whenDate = when.asDate();
		let nowDate = now.asDate();

		//Too far in the future
		if (whenDate.getTime() > nowDate.getTime() + dayInMilliseconds) {
			return false;
		}
		//Too far in the past
		if (whenDate.getTime() < nowDate.getTime() - dayInMilliseconds) {
			return false;
		}

		//Before time starts
		if (whenDate.getTime() < new Date(2016, 10, 30).getTime()) {
			return false;
		}
		//After xmas
		if (whenDate.getTime() > new Date(2016, 11, 25).getTime()) {
			return false;
		}

		//Check when vs lastPlaced
		if (user.dateLastPlaced) {
			let userLastPlacedDate = new JustDate(user.dateLastPlaced);

			if (when.asDate().getTime() <= userLastPlacedDate.asDate().getTime()) {
				return false;
			}
		}

		return true;
	}
}