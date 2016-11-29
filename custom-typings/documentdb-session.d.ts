declare module 'documentdb-session' {
	import * as express from "express";
	import * as session from "express-session";

    function s(options: (options?: session.SessionOptions) => express.RequestHandler): s.DocumentDBStore;

    namespace s {
        interface DocumentDBStore extends session.Store {
            new (options: DocumentDbStoreOptions): session.Store;
        }
		interface DocumentDbStoreOptions {
			collection?: string;
			database?: string;
			discriminator?: any;

			host: string;
			key: string;

			/** In seconds */
			ttl?: number;

		}
    }
	export = s;
}