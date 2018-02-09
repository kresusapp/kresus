const fs = require('fs');
const path = require('path');


module.exports = function(source, map) {
    // Compile dependencies licenses JSON
    var packageJSON = require(path.resolve(__dirname, '..', '..', '..', 'package.json'));
    var dependenciesLicenses = {
        // Static dependencies go here
        weboob: {
            website: "http://weboob.org",
            license: "AGPL-3.0-or-later"
        }
    };
    function pushDepLicense(dep) {
        var depPath = path.resolve(__dirname, '..', '..', '..', 'node_modules', dep, 'package.json');
        var err, data = fs.readFileSync(depPath, 'utf8');
        if (err) {
            console.error(`Unable to read ${depPath}.`);
        }

        try {
            packageData = JSON.parse(data);
        } catch (e) {
            return;
        }

        dependenciesLicenses[dep] = {
            license: packageData.license || null,
            website: packageData.homepage || null,
        };
    }
    Object.keys(packageJSON.dependencies).forEach(pushDepLicense);
    Object.keys(packageJSON.devDependencies).forEach(pushDepLicense);

    return `module.exports = ${JSON.stringify(dependenciesLicenses)}`;
};
