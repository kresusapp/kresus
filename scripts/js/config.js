import * as path from 'path';
import * as fs from 'fs';

const ROOT = path.join(path.dirname(fs.realpathSync(__filename)), '..', '..');

const PATH_TO_CONFIG = path.join(ROOT, 'config.example.ini');

let config = require(path.join(ROOT, 'server', 'config'));

function check() {
    let actualContent = fs.readFileSync(PATH_TO_CONFIG, 'utf8');
    let expectedContent = config.generate();
    if (actualContent.trim() !== expectedContent.trim()) {
        throw new Error(`Content in example configuration file doesn't match
what should be present; did you maybe forget to rerun |make config|?`);
    }
}

function generate() {
    fs.writeFileSync(PATH_TO_CONFIG, config.generate());
}

function main() {
    let argv = process.argv;
    if (argv.length < 3) {
        throw new Error("Second argument mandatory among 'check' or 'generate'");
    }

    let arg = argv[2];
    if (arg === 'check') {
        check();
    } else if (arg === 'generate') {
        generate();
    } else {
        throw new Error("unknown argument `" + arg + "` passed to config.js");
    }
}

try {
    main()
} catch (ex) {
    console.error(ex.message);
    console.log(ex.stack);
    process.exit(-1);
}
