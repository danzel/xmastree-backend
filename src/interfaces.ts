export interface PassportUser {
	provider: string;
	providerId: string;
}

export interface UserModel {
	/** provider|providerId */
	id: string;
	type: 'user';

	provider: string;
	providerId: string;

	userUuid: string;

	/** In format l.getFullYear() * 10000 + (l.getMonth() + 1) * 100 + l.getDate() */
	dateLastPlaced?: number;

	nextDecoration: number;
	amountPlaced: number;
}

export interface DecorationModel {
	/** uuid */
	id: string;
	type: 'decoration';

	decorationType: number;

	x: number;
	y: number;

	placementTime: number;

	userUuid: string;
}

export class JustDate {
	constructor(public value: number) {
	}

	static create(year: number, monthZeroBased: number, dayOfMonth: number) {
		return new JustDate(year * 10000 + (monthZeroBased + 1) * 100 + dayOfMonth);
	}
}