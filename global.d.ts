/* eslint-disable import/unambiguous */

type KresusProcess = {
    user: {
        id: number;
        login: string;
    };
    dataDir: string,
    providedUserId: number,
    port: number,
    host: string,
    pythonExec: string,
    urlPrefix: string,
    salt: string | null,
    forceDemoMode: boolean,
    weboobDir: string | null,
    weboobSourcesList: string | null,
    emailTransport: string,
    emailSendmailBin: string | null,
    emailFrom: string | null,
    smtpHost: string | null,
    smtpPort: number | null,
    smtpUser: string | null,
    smtpPassword: string | null,
    smtpForceTLS: boolean,
    smtpRejectUnauthorizedTLS: boolean,
    appriseApiBaseUrl: string | null,
    basicAuth: { [username: string]: string },
    logFilePath: string,
    dbType: string,
    dbLog: ("error")[] | boolean,
    sqlitePath: string | null,
    dbHost: string | null,
    dbPort: string | null,
    dbUsername: string | null,
    dbPassword: string | null,
    dbName: string,
};

declare namespace NodeJS {
    interface Process {
        kresus: KresusProcess
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
