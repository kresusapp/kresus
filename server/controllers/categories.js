import Category  from '../models/category';
import Operation from '../models/operation';

import {makeLogger, sendErr, asyncErr} from '../helpers';

let log = makeLogger('controllers/categories');

export async function create(req, res) {
    let cat = req.body;

    // Missing parameters
    if (typeof cat.title === 'undefined')
        return sendErr(res, `when creating a category: ${cat}`, 400, "Missing category title");

    try {
        if (typeof cat.parentId !== 'undefined' && !await Category.find(cat.parentId)) {
            throw {
                status: 404,
                message: `Parent category ${cat.parentId} not found`
            };
        }
        let created = await Category.create(cat);
        res.status(200).send(created);
    } catch(err) {
        return asyncErr(res, err, 'when creating category');
    }
}

export async function preloadCategory(req, res, next, id) {
    let category;

    try {
        category = await Category.find(id);
    } catch(err) {
        return asyncErr(res, err, "when preloading a category");
    }

    if (!category)
        return sendErr(res, `Category ${id}`, 404, "Category not found");

    req.preloaded = {category};
    next();
}

export async function update(req, res) {
    let params = req.body;

    // missing parameters
    if (typeof params.title === 'undefined')
        return sendErr(res, `when updating category`, 400, "Missing title parameter");

    let category = req.preloaded.category;
    try {
        let newCat = await category.updateAttributes(params);
        res.status(200).send(newCat);
    } catch (err) {
        return asyncErr(res, err, "when updating a category");
    }
}

module.exports.delete = async function(req, res) {
    let replaceby = req.body.replaceByCategoryId;
    if (typeof replaceby === 'undefined')
        return sendErr(res, "when deleting category", 400, "Missing parameter replaceby");

    let former = req.preloaded.category;

    try {
        if (replaceby.toString() !== '') {
            log.debug(`Replacing category ${former.id} by ${replaceby}...`);
            if (!await Category.find(replaceby)) {
                throw {
                    status: 404,
                    message: "Replacement category not found"
                }
            }
        } else {
            log.debug(`No replacement category, replacing by None.`);
            replaceby = undefined;
        }

        let newAttr = {
            categoryId: replaceby
        };

        let operations = await Operation.byCategory(former.id);
        for (let op of operations) {
            await op.updateAttributes(newAttr);
        }

        await former.destroy();
        res.sendStatus(200);
    } catch (err) {
        return asyncErr(res, err, "when deleting a category");
    }
}
