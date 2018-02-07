import fs from 'fs';
import regexEscape from 'regex-escape';

import Access from '../../models/access';
import Account from '../../models/account';

import { promisify, asyncErr } from '../../helpers';

const readLogs = promisify(fs.readFile);

export function obfuscateKeywords(string, keywords) {
    const regex = Array.from(keywords)
        .map(k => regexEscape(k))
        .join('|');
    return string.replace(new RegExp(`(${regex})`, 'gm'), (all, keyword) =>
        keyword.substr(-3).padStart(keyword.length, '*')
    );
}

function sleep(ms) {
    return new Promise(accept => {
        setTimeout(accept, ms);
    });
}

export async function getLogs(req, res) {
    await sleep(2000);
    try {
        let logs = await readLogs(process.kresus.logFilePath, 'utf-8');
        let sensitiveKeywords = new Set();

        const accounts = await Account.all();
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
                sensitiveKeywords.add(acc.password);
            }
        });

        res
            .status(200)
            .type('text/plain')
            .send(obfuscateKeywords(logs, sensitiveKeywords));
    } catch (err) {
        return asyncErr(res, err, 'when reading logs');
    }
}
