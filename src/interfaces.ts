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

	/** In JustDate format */
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

	/** In JustDate format */
	placementDate: number;
	/** server time as new Date().getTime() */
	placementTime: number;

	userUuid: string;
}

export class JustDate {
	/** value is in format l.getFullYear() * 10000 + (l.getMonth() + 1) * 100 + l.getDate() */
	constructor(public value: number) {
	}

	static create(year: number, monthZeroBased: number, dayOfMonth: number) {
		return new JustDate(year * 10000 + (monthZeroBased + 1) * 100 + dayOfMonth);
	}
}