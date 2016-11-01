import * as americano from 'cozydb';
import { promisifyModel } from '../helpers';

let Category = americano.getModel('bankcategory', {
    // Label of the category.
    title: String,

    // Hexadecimal RGB format.
    color: String,

    // Internal category id.
    parentId: String,

    // Threshold used in the budget section, defined by the user.
    threshold: {
        type: Number,
        default: 0
    }
});

Category = promisifyModel(Category);

module.exports = Category;
