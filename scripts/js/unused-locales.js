/* eslint no-process-exit: 0 */
//
// Static / offline detector for translation keys that are defined in the locale
// JSON files but no longer referenced anywhere in the code.
//
// It is heuristic and REPORT-ONLY: it never exits non-zero, so it can be run in
// CI as an informational step without breaking the build. Run it with:
//
//     yarn ci:locales:unused
//
// How "used" is decided (union of three sources), see the plan for details:
//   1. Literal scan   - the key appears as a quoted string in a .ts/.tsx file.
//   2. Dynamic prefix - a template literal like `client.foo.bar.${x}` exempts the
//                        whole `client.foo.bar.*` subtree (auto-derived from source).
//   3. JSON data      - keys built from shared/transaction-types.json (client.type.*)
//                        and shared/default-categories.json (client.defaultcategories.*).

let path = require('path');
let fs = require('fs');

import { makeLogger } from '../../server/helpers';

const { buildKeys } = require('./locales-keys');

const ROOT = path.join(path.dirname(fs.realpathSync(__filename)), '..', '..');

let log = makeLogger('unused-locales');

// Directories that contain code referencing translation keys.
const SOURCE_DIRS = ['client', 'server', 'shared'];
const SOURCE_EXTENSIONS = ['.ts', '.tsx'];
const EXCLUDED_DIRS = new Set(['node_modules', 'build', 'dist']);

// JSON data files whose values are used as (parts of) translation keys.
const TRANSACTION_TYPES = path.join(ROOT, 'shared', 'transaction-types.json');
const DEFAULT_CATEGORIES = path.join(ROOT, 'shared', 'default-categories.json');

// Reject auto-derived prefixes that are too broad to be meaningful. A one-segment
// prefix like `client.` (from `client.${type.name}`) would otherwise exempt the
// entire tree; such subtrees are instead covered by the JSON-data source.
const MIN_PREFIX_SEGMENTS = 2;

function walk(dir, out) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (EXCLUDED_DIRS.has(entry.name)) continue;
            walk(path.join(dir, entry.name), out);
        } else if (SOURCE_EXTENSIONS.includes(path.extname(entry.name))) {
            out.push(path.join(dir, entry.name));
        }
    }
    return out;
}

// Read all source files into a single blob — every check below is a substring /
// regex scan, so one concatenated string is simplest and fast enough.
function readSources() {
    let files = [];
    for (const dir of SOURCE_DIRS) {
        const abs = path.join(ROOT, dir);
        if (fs.existsSync(abs)) walk(abs, files);
    }
    log.info(`Scanning ${files.length} source files...`);
    return files.map(f => fs.readFileSync(f, 'utf8')).join('\n');
}

// Keys written as full quoted strings: '…', "…" or `…` (no interpolation).
// Locale keys always start with `client.` or `server.` and only contain
// [A-Za-z0-9_.-], which makes this precise (no false substring matches).
function collectLiteralKeys(source) {
    const re = /[`'"]((?:client|server)\.[A-Za-z0-9_.-]+)[`'"]/g;
    const used = new Set();
    let m;
    while ((m = re.exec(source)) !== null) {
        used.add(m[1]);
    }
    return used;
}

// Prefixes of template literals with interpolation, e.g.
//   `client.fetch_error.short.${status}`  ->  client.fetch_error.short.
// Only prefixes under a locale namespace and with enough specificity are kept.
function collectDynamicPrefixes(source) {
    const re = /[`']((?:client|server)\.[A-Za-z0-9_.-]*)\$\{/g;
    const prefixes = new Set();
    let m;
    while ((m = re.exec(source)) !== null) {
        const prefix = m[1];
        const segments = prefix.split('.').filter(Boolean).length;
        if (segments >= MIN_PREFIX_SEGMENTS) {
            prefixes.add(prefix);
        }
    }
    return prefixes;
}

function collectJsonKeys() {
    const used = new Set();

    // transaction-types.json: { name: "type.card" } -> client.type.card
    const types = JSON.parse(fs.readFileSync(TRANSACTION_TYPES, 'utf8'));
    for (const t of types) {
        if (t.name) used.add(`client.${t.name}`);
    }

    // default-categories.json: { label: "client.defaultcategories.x" } (full key)
    const categories = JSON.parse(fs.readFileSync(DEFAULT_CATEGORIES, 'utf8'));
    for (const c of categories) {
        if (c.label) used.add(c.label);
    }

    return used;
}

// --- main -----------------------------------------------------------------

const englishFile = path.join(ROOT, 'shared', 'locales', 'en.json');
const englishLocale = require(englishFile);

// Strip the leading dot that buildKeys prepends.
const definedKeys = buildKeys(englishLocale).map(k => k.slice(1));
log.info(`Found ${definedKeys.length} keys defined in en.json.`);

const source = readSources();

const literalKeys = collectLiteralKeys(source);
const dynamicPrefixes = collectDynamicPrefixes(source);
const jsonKeys = collectJsonKeys();

log.info(`Honoring ${dynamicPrefixes.size} auto-derived dynamic prefixes: ${
    [...dynamicPrefixes].sort().join(', ') || '(none)'
}`);

function isUsed(key) {
    if (literalKeys.has(key)) return true;
    if (jsonKeys.has(key)) return true;
    return [...dynamicPrefixes].some(prefix => key.startsWith(prefix));
}

const unused = definedKeys.filter(k => !isUsed(k)).sort();

if (unused.length) {
    log.warn(`Found ${unused.length} potentially unused key(s) in the locales:`);
    for (const k of unused) {
        log.warn(`  ${k}`);
    }
    log.warn(
        'Heuristic check: verify before deleting, especially keys built dynamically.'
    );
} else {
    log.info('No unused keys found.');
}

// Report-only: always succeed.
process.exit(0);
