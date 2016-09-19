import * as americano from 'cozydb';
import { promisifyModel } from '../helpers';

let Category = americano.getModel('bankcategory', {
    title: String,
    // Hexadecimal RGB format
    color: String,
    // Internal category id
    parentId: String,
    threshold: { type: Number, default: 0 }
});

Category = promisifyModel(Category);

module.exports = Category;
