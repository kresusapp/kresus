import fs from 'fs';

import Accesses from '../../models/accesses';
import Accounts from '../../models/accounts';

import { promisify, asyncErr } from '../../helpers';
import { obfuscateKeywords, obfuscatePasswords } from './helpers';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

export async function getLogs(req, res) {
    try {
        let { id: userId } = req.user;
        let logs = await readFile(process.kresus.logFilePath, 'utf-8');
        let sensitiveKeywords = new Set();
        let passwords = new Set();

        const accounts = await Accounts.all(userId);
        accounts.forEach(acc => {
            if (acc.accessId) {
                sensitiveKeywords.add(acc.accessId);
            }

            if (acc.vendorAccountId) {
                sensitiveKeywords.add(acc.vendorAccountId);
            }

            if (acc.iban) {
                sensitiveKeywords.add(acc.iban);
            }
        });

        const accesses = await Accesses.all(userId);
        accesses.forEach(acc => {
            if (acc.login) {
                sensitiveKeywords.add(acc.login);
            }

            if (acc.password) {
                passwords.add(acc.password);
            }
        });

        logs = obfuscateKeywords(logs, sensitiveKeywords);
        logs = obfuscatePasswords(logs, passwords);

        res.status(200)
            .type('text/plain')
            .send(logs);
    } catch (err) {
        return asyncErr(res, err, `when reading logs from ${process.kresus.logFilePath}`);
    }
}

export async function clearLogs(req, res) {
    try {
        await writeFile(process.kresus.logFilePath, '');
        res.status(200).end();
    } catch (err) {
        return asyncErr(res, err, 'when clearing logs');
    }
}
