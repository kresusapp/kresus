import {module as americano} from '../db';
import {promisifyModel} from '../helpers';

let Category = americano.getModel('bankcategory', {
    title: String,
    parentId: String
});

Category = promisifyModel(Category);

export default Category;
