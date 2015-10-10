import * as americano from 'cozydb';
import {promisifyModel} from '../helpers';

let Category = americano.getModel('bankcategory', {
    title: String,
    parentId: String
});

Category = promisifyModel(Category);

Category.NONE_CATEGORY_ID = -1;

export default Category;
