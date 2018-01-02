import * as cozydb from 'cozydb';
import { promisifyModel } from '../../helpers';

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

module.exports = Category;
