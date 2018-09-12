/* eslint no-process-exit: 0 */

import * as path from 'path';
import * as fs from 'fs';

import banks from '../../shared/banks.json';
import { makeLogger } from '../../server/helpers';

const ROOT = path.join(path.dirname(fs.realpathSync(__filename)), '..', '..');

let log = makeLogger('check-banks');

const imagesDir = path.join(ROOT, 'static', 'images', 'banks');

let missingLogo = false;

let fieldTranslationKeys = new Set();
log.info('Checking all banks have a logo...');
for (let bank of banks) {
    try {
        // Test for logo existence.
        let imagePath = path.join(imagesDir, `${bank.uuid}.png`);
        fs.accessSync(imagePath, fs.F_OK);
    } catch (e) {
        log.error(`Missing logo for ${bank.uuid}.`);
        missingLogo = true;
    }

    if (typeof bank.customFields !== 'undefined') {
        for (let field of bank.customFields) {
            if (
                typeof field.name !== 'undefined' &&
                !fieldTranslationKeys.has(`client.settings.${field.name}`)
            ) {
                fieldTranslationKeys.add(`client.settings.${field.name}`);
            }
            if (
                typeof field.placeholderKey !== 'undefined' &&
                !fieldTranslationKeys.has(field.placeholderKey)
            ) {
                fieldTranslationKeys.add(field.placeholderKey);
            }
            if (
                field.type === 'select' &&
                !fieldTranslationKeys.has(`client.accountwizard.no_${field.name}_found`)
            ) {
                fieldTranslationKeys.add(`client.accountwizard.no_${field.name}_found`);
            }
        }
    }
}

if (missingLogo) {
    log.error('At least one missing logo.');
    process.exit(1);
}
log.info('\tSuccess!');

log.info('Checking all bank logos are used...');
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
log.info('\tSuccess!');

log.info("Checking all bank labelKey's have a translation...");
const localesPath = path.join(ROOT, 'shared', 'locales');
let missingBankLocale = false;

for (let locale of fs.readdirSync(localesPath)) {
    let localeFile = require(path.join(localesPath, locale));
    for (let key of fieldTranslationKeys.keys()) {
        // Deep inspection of localeFile.
        let value = key.split('.').reduce((trans, k) => (typeof trans === 'undefined' ? trans : trans[k]), localeFile);
        if (typeof value === 'undefined') {
            log.error(`Missing key ${key} in ${locale} file`);
            missingBankLocale = true;
        }
    }
}

if (missingBankLocale) {
    log.error('At least one missing translation for bank form keys.');
    process.exit(1);
}

log.info('PASS.');
process.exit(0);
