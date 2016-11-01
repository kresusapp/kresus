/* eslint no-process-exit: 0 */

import * as path from 'path';
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

let missingLogo = false;
for (let bank of banks) {
    try {
        let imagePath = path.join(imagesDir, `${bank.uuid}.png`);
        fs.accessSync(imagePath, fs.F_OK);
    } catch (e) {
        log.error(`Missing logo for ${bank.uuid}.`);
        missingLogo = true;
    }
}

if (missingLogo) {
    log.error('At least one missing logo.');
    process.exit(1);
}

let imageFiles = [];
fs.readdirSync(imagesDir).forEach(child => {
    let file = path.join(imagesDir, child);
    if (fs.statSync(file).isDirectory()) {
        log.error("The images dir shouldn't contain a directory!");
        process.exit(1);
    }
    let cleanName = child.replace('.png', '');
    imageFiles.push(cleanName);
});

let bankSet = new Set(banks.map(bank => bank.uuid));

let orphanImage = false;
for (let file of imageFiles) {
    if (!bankSet.has(file)) {
        log.error(`Superfluous logo in the logo directory: ${file}.`);
        orphanImage = true;
    }
}

if (orphanImage) {
    log.error('At least one orphan image.');
    process.exit(1);
}

log.info('CheckLogos: OK.');
process.exit(0);
