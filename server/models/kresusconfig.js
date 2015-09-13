let americano = require('../db').module;

let Config = americano.getModel('kresusconfig', {
    name: String,
    value: String
});

Config.all = function(cb) {
    Config.request("all", cb);
}

Config.byName = function(name, cb) {
    let param = {
        key: name
    };
    Config.request('byName', param, (err, founds) => {
        if (err)
            return cb(err);

        if (founds && founds.length)
            return cb(null, founds[0]);

        cb(null, null);
    });
}

Config.findOrCreateByName = function(name, defaultValue, cb) {
    Config.byName(name, (err, found) => {

        if (err)
            return cb(`Error when reading setting ${name}: ${err}`);

        if (!found) {
            let pair = {
                name,
                value: defaultValue
            }

            Config.create(pair, (err, pair) => {
                if (err)
                    return cb(`Error when creating setting ${name}: ${err}`);
                cb(null, pair);
            });
            return;
        }

        cb(null, found);
    });
}

export default Config;
