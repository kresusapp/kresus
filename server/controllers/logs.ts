import fs from 'fs';
import express from 'express';
import { promisify } from 'util';

import { Access, Account } from '../models';
import { asyncErr } from '../helpers';

import { obfuscateEmails, obfuscateKeywords, obfuscatePasswords } from './helpers';
import { IdentifiedRequest } from './routes';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

export async function getLogs(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        let logs = await readFile(process.kresus.logFilePath, 'utf-8');
        const sensitiveKeywords: Set<string> = new Set();
        const passwords: Set<string> = new Set();

        const accounts = await Account.all(userId);
        accounts.forEach(acc => {
            if (acc.accessId) {
                sensitiveKeywords.add(String(acc.accessId));
            }

            if (acc.vendorAccountId) {
                sensitiveKeywords.add(acc.vendorAccountId);
            }

            if (acc.iban) {
                sensitiveKeywords.add(acc.iban);
            }
        });

        const accesses = await Access.all(userId);
        accesses.forEach(acc => {
            if (acc.login) {
                sensitiveKeywords.add(acc.login);
            }

            if (acc.password) {
                passwords.add(acc.password);
            }
        });

        if (process.kresus.smtpUser) {
            sensitiveKeywords.add(process.kresus.smtpUser);
        }

        if (process.kresus.smtpPassword) {
            passwords.add(process.kresus.smtpPassword);
        }

        logs = obfuscateKeywords(logs, sensitiveKeywords);
        logs = obfuscatePasswords(logs, passwords);
        logs = obfuscateEmails(logs);

        res.status(200).type('text/plain').send(logs);
    } catch (err) {
        asyncErr(res, err, `when reading logs from ${process.kresus.logFilePath}`);
    }
}

export async function clearLogs(_req: IdentifiedRequest<any>, res: express.Response) {
    try {
        await writeFile(process.kresus.logFilePath, '');
        res.status(200).end();
    } catch (err) {
        asyncErr(res, err, 'when clearing logs');
    }
}
