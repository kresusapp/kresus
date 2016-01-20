import Category  from '../models/category';
import Operation from '../models/operation';

import { makeLogger, sendErr, asyncErr } from '../helpers';

let log = makeLogger('controllers/categories');

export async function create(req, res) {
    let cat = req.body;

    // Missing parameters
    if (typeof cat.title === 'undefined')
        return sendErr(res, `when creating a category: ${cat}`, 400,
                       'Missing category title');

    if (typeof cat.color === 'undefined')
        return sendErr(res, `when creating a category: ${cat}`, 400,
                       'Missing category color');

    try {
        if (typeof cat.parentId !== 'undefined') {
            let parent = await Category.find(cat.parentId);
            if (!parent) {
                throw {
                    status: 404,
                    message: `Parent category ${cat.parentId} not found`
                };
            }
        }
        let created = await Category.create(cat);
        res.status(200).send(created);
    } catch (err) {
        return asyncErr(res, err, 'when creating category');
    }
}

export async function preloadCategory(req, res, next, id) {
    let category;

    try {
        category = await Category.find(id);
    } catch (err) {
        return asyncErr(res, err, 'when preloading a category');
    }

    if (!category)
        return sendErr(res, `Category ${id}`, 404, 'Category not found');

    req.preloaded = { category };
    next();
}

export async function update(req, res) {
    let params = req.body;

    // missing parameters
    if (typeof params.title === 'undefined')
        return sendErr(res, `when updating category`, 400,
                       'Missing title parameter');

    if (typeof params.color === 'undefined')
        return sendErr(res, `when updating category`, 400,
                       'Missing color parameter');

    let category = req.preloaded.category;
    try {
        let newCat = await category.updateAttributes(params);
        res.status(200).send(newCat);
    } catch (err) {
        return asyncErr(res, err, 'when updating a category');
    }
}

module.exports.delete = async function(req, res) {
    let replaceby = req.body.replaceByCategoryId;
    if (typeof replaceby === 'undefined')
        return sendErr(res, 'when deleting category', 400,
                       'Missing parameter replaceby');

    let former = req.preloaded.category;

    try {
        let categoryId;
        if (replaceby.toString() !== '') {
            log.debug(`Replacing category ${former.id} by ${replaceby}...`);
            let categoryToReplaceBy = await Category.find(replaceby);
            if (!categoryToReplaceBy) {
                throw {
                    status: 404,
                    message: 'Replacement category not found'
                };
            }
            categoryId = replaceby;
        } else {
            log.debug(`No replacement category, replacing by None.`);
            categoryId = null;
        }

        let operations = await Operation.byCategory(former.id);
        for (let op of operations) {
            await op.updateAttributes({ categoryId });
        }

        await former.destroy();
        res.sendStatus(200);
    } catch (err) {
        return asyncErr(res, err, 'when deleting a category');
    }
};
