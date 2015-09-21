let async = require('async');

let log = require('printit')({
    prefix: 'controllers/categories',
    date: true
});

let BankCategory  = require('../models/category');
let BankOperation = require('../models/operation');

let h = require('./helpers');

// Model helpers
let mFindById = h.promisify(::BankCategory.find);
let mCreate = h.promisify(::BankCategory.create);

export async function create(req, res) {
    let cat = req.body;

    // Missing parameters
    if (typeof cat.title === 'undefined') {
        res.status(400).send({error: 'Missing title in category'});
        return;
    }

    try {
        if (typeof cat.parentId !== 'undefined' && !await mFindById(cat.parentId)) {
            log.error(`parent category not found: ${cat.parentId}`);
            res.status(404).send({error: 'Parent category not found!'});
            throw false;
        }
        let created = await mCreate(cat);
        res.status(200).send(created);
    } catch(err) {
        if (!err)
            return;
        log.error('when creating category: ' + err.toString());
        res.status(500).send({error:'Server error when creating category'});
    }
}

export async function preloadCategory(req, res, next, id) {
    let category;

    try {
        category = await mFindById(id);
    } catch(err) {
        log.error('when loading a category: ' + err.toString());
        res.status(500).send({error: "Server error when loading a category"});
        return;
    }

    if (!category) {
        res.status(404).send({error: "Category not found"});
        return;
    }
    req.preloaded = {category};
    next();
}

export function update(req, res) {
    let cat = req.body;

    // missing parameters
    if (typeof cat.title === 'undefined') {
        res.status(400).send({error: 'Missing parameter title'});
        return;
    }

    req.preloaded.category.updateAttributes(cat, (err, newCat) => {
        if (err) {
            log.error('when updating a category: ' + err.toString());
            res.status(500).send({error: 'Server error when updating category'});
            return;
        }
        res.send(200, newCat);
    });
}

module.exports.delete = function(req, res) {
    let replaceby = req.body.replaceByCategoryId;

    if (typeof replaceby === 'undefined') {
        res.status(400).send({error: 'Missing parameter replaceby'});
        return;
    }

    let former = req.preloaded.category;

    function next() {
        BankOperation.allByCategory(former.id, (err, ops) => {
            if (err) {
                log.error('when finding all operations by category: ' + err.toString());
                res.status(500).send({error: 'Server error when deleting category'});
                return;
            }

            let attr = {
                categoryId: replaceby
            };

            function updateOne(op, cb) {
                op.updateAttributes(attr, cb);
            }

            async.each(ops, updateOne, (err) => {
                if (err) {
                    log.error('when updating some operations categories: ' + err.toString());
                    res.status(500).send({error: 'Server error when updating new category'});
                    return;
                }

                former.destroy(err => {
                    if (err) {
                        log.error('when deleting the category: ' + err.toString());
                        res.status(500).send({error: 'Server error when deleting category'});
                        return;
                    }

                    res.sendStatus(200);
                });
            });
        });
    }

    // check that the replacement category actually exists
    if (replaceby.toString() !== '-1') {
        log.debug('replacing by another category');
        BankCategory.find(replaceby, (err, rcat) => {
            if (err) {
                log.error('when finding replacement category: ' + err.toString());
                res.status(404).send({error: 'replacement category not found'});
                return;
            }
            next();
        });
        return;
    }

    log.debug('replacing by none');
    next();
}
