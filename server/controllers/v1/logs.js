import fs from 'fs';
import regexEscape from 'regex-escape';

import Access from '../../models/access';
import Account from '../../models/account';

import { promisify, asyncErr } from '../../helpers';

const readLogs = promisify(fs.readFile);

export function obfuscatePasswords(string, passwords) {
    // Prevents the application of the regexp s//*******/g
    if (!passwords.size) {
        return string;
    }

    const regex = [...passwords].map(k => regexEscape(k)).join('|');

    // Always return a fixed width string
    return string.replace(new RegExp(`(${regex})`, 'gm'), '********');
}

export function obfuscateKeywords(string, keywords) {
    // Prevents the application of the regexp s//*******/g
    if (!keywords.size) {
        return string;
    }
    const regex = [...keywords].map(k => regexEscape(k)).join('|');
    return string.replace(new RegExp(`(${regex})`, 'gm'), (all, keyword) =>
        keyword.substr(-3).padStart(keyword.length, '*')
    );
}

export async function getLogs(req, res) {
    try {
        let { id: userId } = req.user;
        let logs = await readLogs(process.kresus.logFilePath, 'utf-8');
        let sensitiveKeywords = new Set();
        let passwords = new Set();

        const accounts = await Account.all(userId);
        accounts.forEach(acc => {
            if (acc.bankAccess) {
                sensitiveKeywords.add(acc.bankAccess);
            }

            if (acc.accountNumber) {
                sensitiveKeywords.add(acc.accountNumber);
            }

            if (acc.iban) {
                sensitiveKeywords.add(acc.iban);
            }
        });

        const accesses = await Access.all();
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
