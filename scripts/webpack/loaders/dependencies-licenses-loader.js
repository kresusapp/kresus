const fs = require('fs');
const path = require('path');

const kresusRoot = path.resolve(__dirname, '..', '..', '..');
const staticDependencies = {
    // Static dependencies go here
    weboob: {
        website: "http://weboob.org",
        license: "LGPL-3.0-or-later"
    },

    "money (manual bank icon)": {
        website: "https://thenounproject.com/search/?q=money&i=798457",
        license: "CCBY",
        author: "Gregory Cresnar"
    }
};

function pushDepLicense(dep, dependencies) {
    var depPath = path.resolve(kresusRoot, 'node_modules', dep, 'package.json');
    var err, data = fs.readFileSync(depPath, 'utf8');
    if (err) {
        console.error(`Unable to read ${depPath}.`);
        return;
    }

    try {
        packageData = JSON.parse(data);
    } catch (e) {
        return;
    }

    dependencies[dep] = {
        license: packageData.license || null,
        website: packageData.homepage || null,
    };
}

module.exports = function(source, map) {
    // Compile dependencies licenses JSON
    var packageJson = require(path.resolve(kresusRoot, 'package.json'));

    var dependencies = Object.assign({}, staticDependencies);

    Object.keys(packageJson.dependencies).forEach(dep => pushDepLicense(dep, dependencies));
    Object.keys(packageJson.devDependencies).forEach(dep => pushDepLicense(dep, dependencies));

    return `module.exports = ${JSON.stringify(dependencies)}`;
};
