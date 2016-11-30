import test from 'ava';

import documentdb = require('documentdb');

import { createDatabase } from './util';
import { UserRepository } from '../src/repositories'
import { JustDate, UserModel } from '../src/interfaces'

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

test('can add decoration when never placed', (t) => {
	let repo = new UserRepository(null, null, null);
	
	let user = <UserModel><any>{
		dateLastPlaced: null
	};

	let canPlace = repo.userCanPlaceDecoration(user, JustDate.create(2016, 11, 1), JustDate.create(2016, 11, 1));

	t.true(canPlace);
});

test('cant add decoration twice on one day', (t) => {
	let repo = new UserRepository(null, null, null);
	
	let user = <UserModel><any>{
		dateLastPlaced: JustDate.create(2016, 11, 1).value
	};

	let canPlace = repo.userCanPlaceDecoration(user, JustDate.create(2016, 11, 1), JustDate.create(2016, 11, 1));

	t.false(canPlace);
});

test('cant add decoration in past compared to last placement', (t) => {
	let repo = new UserRepository(null, null, null);
	
	let user = <UserModel><any>{
		dateLastPlaced: JustDate.create(2016, 11, 2).value
	};

	let canPlace = repo.userCanPlaceDecoration(user, JustDate.create(2016, 11, 1), JustDate.create(2016, 11, 1));

	t.false(canPlace);
});

test('cant add decoration too far in the past or future', (t) => {
	let repo = new UserRepository(null, null, null);
	
	let user = <UserModel><any>{
		dateLastPlaced: null
	};

	
	t.false(repo.userCanPlaceDecoration(user, JustDate.create(2016, 10, 29), JustDate.create(2016, 11, 1))) //Before the start of time
	t.true(repo.userCanPlaceDecoration(user, JustDate.create(2016, 10, 30), JustDate.create(2016, 11, 1)))

	t.false(repo.userCanPlaceDecoration(user, JustDate.create(2016, 11, 1), JustDate.create(2016, 11, 3)))
	t.true(repo.userCanPlaceDecoration(user, JustDate.create(2016, 11, 2), JustDate.create(2016, 11, 3)))
	t.true(repo.userCanPlaceDecoration(user, JustDate.create(2016, 11, 3), JustDate.create(2016, 11, 3)))
	t.true(repo.userCanPlaceDecoration(user, JustDate.create(2016, 11, 4), JustDate.create(2016, 11, 3)))
	t.false(repo.userCanPlaceDecoration(user, JustDate.create(2016, 11, 5), JustDate.create(2016, 11, 3)))

	t.false(repo.userCanPlaceDecoration(user, JustDate.create(2016, 11, 26), JustDate.create(2016, 11, 25)))
	
});

