import test from 'ava';

import documentdb = require('documentdb');

import { createDatabase } from './util';
import { UserRepository } from '../src/repositories'
import { JustDate } from '../src/interfaces'

test('can get user', async (t) => {
	let db = await createDatabase();
	try {
		let repository = new UserRepository(db.client, db.database, db.collection);

		let user = await repository.getOrCreateUser('facebook', 'asd');

		t.truthy(user);

		t.is(user.amountPlaced, 0);
		t.is(user.id, 'facebook|asd');
	}
	finally {
		db.client.deleteCollection(db.collection._self, {}, () => { });
	}
});

test('can update user', async (t) => {
	let db = await createDatabase();
	try {
		let repository = new UserRepository(db.client, db.database, db.collection);

		let user = await repository.getOrCreateUser('facebook', 'asd');
		let originalAmount = user.amountPlaced;
		let originalDecoration = user.nextDecoration;

		let when = JustDate.create(2016, 11, 30);
		await repository.updateUserHasPlacedDecoration(user, when);

		let user2 = await repository.getOrCreateUser('facebook', 'asd');

		t.is(user2.amountPlaced, originalAmount + 1);
		t.not(user2.nextDecoration, originalDecoration);
		t.is(user2.dateLastPlaced, when.value);
	}
	finally {
		db.client.deleteCollection(db.collection._self, {}, () => { });
	}
});