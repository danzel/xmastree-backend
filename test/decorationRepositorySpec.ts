import test from 'ava';

import documentdb = require('documentdb');

import { createDatabase } from './util';
import { DecorationRepository } from '../src/repositories'
import { JustDate, UserModel } from '../src/interfaces'

test('can add decoration', async (t) => {
	let db = await createDatabase();
	try {
		let repo = new DecorationRepository(db.client, db.database, db.collection);
		let date = JustDate.create(2016, 10, 30);

		await repo.addDecoration(10, 20, 1, date, 123456, <UserModel>{ userUuid: 'abc' })

		let decorations = await repo.getAllDecorations();

		t.is(decorations.length, 1);

		t.is(decorations[0].x, 10);
		t.is(decorations[0].y, 20);
		t.is(decorations[0].placementDate, date.value);
		t.is(decorations[0].placementTime, 123456);
		t.is(decorations[0].decorationType, 1);
		t.is(decorations[0].userUuid, 'abc');
	}
	finally {
		db.client.deleteCollection(db.collection._self, {}, () => { });
	}
});