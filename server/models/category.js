import * as americano from 'cozydb';
import { promisifyModel } from '../helpers';

let Category = americano.getModel('bankcategory', {
    title: String,
    // Internal category id
    parentId: String
});

Category = promisifyModel(Category);

module.exports = Category;
