import fs from 'fs';
import path from 'path';

import {
    promisify,
    asyncErr
} from '../helpers';

function sensitiveDataObfuscator(all, sensitive) {
    return sensitive.substr(-4).padStart(sensitive.length, '*');
}

async function getLogs(req, res) {
    let readLogs = promisify(fs.readFile);
    try {
        let logPath = path.join(__dirname, '..', '..', '..') + '/kresus.log';
        let logs = await readLogs(logPath, 'utf-8');

        logs = logs.replace(/(EXPIRED_PASSWORD|test)/gm, sensitiveDataObfuscator);
        res.status(200).type('text/plain').send(logs);
    } catch (err) {
        return asyncErr(res, err, 'when reading logs');
    }
}

export default {
    logs: {
        get: getLogs
    }
};
