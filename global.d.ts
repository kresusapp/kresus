/* eslint-disable import/unambiguous */
declare namespace NodeJS {
    interface Process {
        kresus: {
            user: {
                id?: number;
                login: string;
            };

            providedUserId?: number;

            // Allow any other property
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [x: string]: any;
        };
    }
}

// Extend express Request interface to allow a "user" variable for preloads.
declare namespace Express {
    export interface Request {
        user?: {
            id?: number;
        };
    }
}
