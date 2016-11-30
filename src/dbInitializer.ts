import documentdb = require('documentdb');

export interface Db {
	client: documentdb.DocumentClient;
	database: documentdb.DatabaseMeta;
	collection: documentdb.CollectionMeta;
}

export async function initializeDb(url: string, auth: documentdb.AuthOptions, databaseName: string, collectionName: string): Promise<Db> {
	return new Promise<Db>((resolve, reject) => {
		let client = new documentdb.DocumentClient(url, auth);

		client.queryDatabases({
			query: 'SELECT * FROM root r WHERE r.id=@id',
			parameters: [
				{ name: '@id', value: databaseName }
			]
		}).toArray((err, res) => {
			if (err) {
				reject(err);
				return;
			}
			if (res.length === 0) {
				client.createDatabase({ id: databaseName }, {}, (err, db) => {
					if (err) {
						reject(err);
					} else {
						client.queryCollections(db._self, {
							query: 'SELECT * FROM root r WHERE r.id=@id',
							parameters: [
								{ name: '@id', value: collectionName }
							]
						}).toArray((err, res) => {
							if (err) {
								reject(err);
								return;
							}

							if (res.length === 0) {
								client.createCollection(db._self, { id: collectionName }, {}, (err, collection) => {
									if (err) {
										reject(err);
									} else {
										resolve({ client: client, database: db, collection });
									}
								});
							} else {
								resolve({
									client,
									database: db,
									collection: res[0]
								});
							}
						})
					}
				})
			} else {
				let db = res[0];
				client.queryCollections(db._self, {
					query: 'SELECT * FROM root r WHERE r.id=@id',
					parameters: [
						{ name: '@id', value: collectionName }
					]
				}).toArray((err, res) => {
					if (err) {
						reject(err);
						return;
					}

					if (res.length === 0) {
						client.createCollection(db._self, { id: collectionName }, {}, (err, collection) => {
							if (err) {
								reject(err);
							} else {
								resolve({ client: client, database: db, collection });
							}
						});
					} else {
						resolve({
							client,
							database: db,
							collection: res[0]
						});
					}
				})
			}
		})
	})
}