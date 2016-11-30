import documentdb = require('documentdb');
import uuid = require('node-uuid');

import { JustDate, DecorationModel, UserModel } from '../interfaces';

export class DecorationRepository {
	constructor(private client: documentdb.DocumentClient, private database: documentdb.DatabaseMeta, private collection: documentdb.CollectionMeta) {
	}

	async addDecoration(x: number, y: number, decorationType: number, whenDate: JustDate, when: number, who: UserModel): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			let decoration: DecorationModel = {
				decorationType: decorationType,
				id: uuid.v4(),
				placementDate: whenDate.value,
				placementTime: when,
				type: 'decoration',
				userUuid: who.userUuid,
				x,
				y
			};
			this.client.createDocument(this.collection._self, decoration, {}, (err, res) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			})
		})
	}

	async getAllDecorations(): Promise<DecorationModel[]> {
		return new Promise<DecorationModel[]>((resolve, reject) => {
			this.client.queryDocuments(this.collection._self,
				<documentdb.SqlQuerySpec>{
					query: "SELECT * FROM " + this.collection.id + " c WHERE c.type='decoration' ORDER BY c.placementTime",
				}, {}).toArray((err, res) => {
					if (err) {
						reject(err);
					} else {
						resolve(<DecorationModel[]><any>res);
					}
				})
		})
	}
}