const fs = require('fs');
const path = require('path');

const kresusRoot = path.resolve(__dirname, '..', '..');
const targetFile = path.resolve(kresusRoot, 'client', 'components', 'about', 'dependencies.json');

const staticDependencies = {
    // Static dependencies go here
    woob: {
        website: "http://woob.tech",
        license: "LGPL-3.0-or-later"
    },

    "money (manual bank icon)": {
        website: "https://thenounproject.com/search/?q=money&i=798457",
        license: "CCBY",
        author: "Gregory Cresnar"
    }
};

function pushDepLicense(dep, dependencies) {
    const depPath = path.resolve(kresusRoot, 'node_modules', dep, 'package.json');

    let packageData;
    try {
        packageData = JSON.parse(fs.readFileSync(depPath, 'utf8'));
    } catch (e) {
        console.error("unable to read or parse package.json file for dependency", dep);
        return;
    }

    dependencies[dep] = {
        license: packageData.license || null,
        website: packageData.homepage || null,
    };
}

// Compile dependencies licenses JSON.
const packageJson = require(path.resolve(kresusRoot, 'package.json'));
const dependencies = Object.assign({}, staticDependencies);

Object.keys(packageJson.dependencies).forEach(dep => pushDepLicense(dep, dependencies));
Object.keys(packageJson.devDependencies).forEach(dep => pushDepLicense(dep, dependencies));

const content = JSON.stringify(dependencies, null, 4);
fs.writeFileSync(targetFile, content);
