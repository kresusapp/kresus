/* eslint no-process-exit: 0 */
import * as path from 'path-extra';
import * as fs from 'fs';
import banks from '../shared/banks.json';
let log = require('printit')({
    prefix: 'check-logos'
});

let imagesDir = path.join(path.dirname(fs.realpathSync(__filename)),
                           '..',
                           'static',
                           'images',
                           'banks');

let allLogoHere = true;

for (let bank of banks) {
    try {
        let imagePath = path.join(imagesDir, `${bank.uuid}.png`);
        fs.accessSync(imagePath, fs.F_OK);
    } catch (e) {
    // It isn't accessible
        log.error(`${bank.uuid} : there is no logo for this module/bank`);
        allLogoHere = false;
    }
}

if (!allLogoHere) {
    process.exit(1);
}

log.info('CheckLogos: OK.');
process.exit(0);
