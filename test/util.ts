import documentdb = require('documentdb');
import uuid = require('node-uuid');

interface Db {
	client: documentdb.DocumentClient;
	database: documentdb.DatabaseMeta;
	collection: documentdb.CollectionMeta;
}

const url = 'https://localhost:8081/';
const auth = <documentdb.AuthOptions>{
	masterKey: 'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw=='
}

export async function createDatabase(): Promise<Db> {

	//Work around self signed certificate
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

	let databaseDef = { id: 'testdb' }; //id: uuid.v4() };
	let collectionDef = { id: 'c' + uuid.v4().replace(/-/g, '') };

	return new Promise<Db>((resolve, reject) => {
		let client = new documentdb.DocumentClient(url, auth);

		client.queryDatabases({
			query: 'SELECT * FROM root r WHERE r.id=@id',
			parameters: [
				{ name: '@id', value: databaseDef.id }
			]
		}).toArray((err, res) => {
			if (err) {
				reject(err);
				return;
			}
			if (res.length === 0) {
				client.createDatabase(databaseDef, {}, (err, db) => {
					if (err) {
						reject(err);
					} else {
						client.createCollection(db._self, collectionDef, {}, (err, collection) => {
							if (err) {
								reject(err);
							} else {
								resolve({ client: client, database: db, collection });
							}
						});
					}
				})
			} else {
				let db = res[0];
				client.createCollection(db._self, collectionDef, {}, (err, collection) => {
					if (err) {
						reject(err);
					} else {
						resolve({ client: client, database: db, collection });
					}
				});
			}
		});
	});
}