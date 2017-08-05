/**
 * Run self-tests against the v1 API of Kresus.
 */
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

import { server as appServer, opts } from '../bin/kresus';
import { makeLogger } from '../server/helpers';
// TODO: import { api as v1API } from './server/controllers/v1/routes';
import v1API from '../server/controllers/v1/routes/accounts';
import { API_PREFIX as v1API_PREFIX  } from '../server/controllers/v1/routes';

const log = makeLogger('test-server-api-v1');

appServer.then(_ => {
    log.info('Let\'s start testing the Kresus v1 API!');
    v1API.test(
        new URL(v1API_PREFIX, `http://localhost:${opts.port}`),
        function (error, results) {
            if (error) {
                log.error(error);
                return process.exit(1);
            }
            if (results.failed.length > 0) {
                let resultsJSON = JSON.stringify(results, null, 2);
                log.error(`Some self-tests failed:\n${resultsJSON}`);
                fs.writeFileSync(
                    path.resolve(
                        __dirname,
                        '..', 'build', 'reports', 'test-api-v1.json'
                    ),
                    resultsJSON
                );
                return process.exit(1);
            }
            return process.exit(0);
        }
    );
});
