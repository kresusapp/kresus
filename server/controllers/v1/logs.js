import fs from 'fs';
import path from 'path';

import Access from '../../models/access';
import Account from '../../models/account';

import {
    promisify,
    asyncErr
} from '../../helpers';

function sensitiveDataObfuscator(all, sensitive) {
    return sensitive.substr(-3).padStart(sensitive.length, '*');
}

export async function getLogs(req, res) {
    let readLogs = promisify(fs.readFile);
    try {
        let logs = await readLogs(process.kresus.logFilePath, 'utf-8');
        let sensitiveKeywords = [];

        const accounts = await Account.all();
        accounts.forEach(acc => {
            if (acc.bankAccess && !sensitiveKeywords.includes(acc.bankAccess)) {
                sensitiveKeywords.push(acc.bankAccess);
            }

            if (acc.accountNumber && !sensitiveKeywords.includes(acc.accountNumber)) {
                sensitiveKeywords.push(acc.accountNumber);
            }

            if (acc.iban && !sensitiveKeywords.includes(acc.iban)) {
                sensitiveKeywords.push(acc.iban);
            }
        });

        const accesses = await Access.all();
        accesses.forEach(acc => {
            if (acc.login && !sensitiveKeywords.includes(acc.login)) {
                sensitiveKeywords.push(acc.login);
            }

            if (acc.password && !sensitiveKeywords.includes(acc.password)) {
                sensitiveKeywords.push(acc.password);
            }
        });

        logs = logs.replace(
            new RegExp(`(${sensitiveKeywords.join('|')})`, 'gm'),
            sensitiveDataObfuscator
        );
        res.status(200).type('text/plain').send(logs);
    } catch (err) {
        return asyncErr(res, err, 'when reading logs');
    }
}
