import * as cozydb from 'cozydb';
import { assert, promisifyModel } from '../helpers';

let Category = cozydb.getModel('bankcategory', {
    // Internal category id.
    parentId: String,

    // Label of the category.
    title: String,

    // Hexadecimal RGB format.
    color: String,

    // Threshold used in the budget section, defined by the user.
    threshold: {
        type: Number,
        default: 0
    }
});

Category = promisifyModel(Category);

let olderFind = Category.find;
Category.find = async function(userId, categoryId) {
    assert(userId === 0, 'Category.find first arg must be the userId.');
    return await olderFind(categoryId);
};

let olderAll = Category.all;
Category.all = async function(userId) {
    assert(userId === 0, 'Category.all first arg must be the userId.');
    return await olderAll();
};

let olderCreate = Category.create;
Category.create = async function(userId, attributes) {
    assert(userId === 0, 'Category.create first arg must be the userId.');
    return await olderCreate(attributes);
};

module.exports = Category;
