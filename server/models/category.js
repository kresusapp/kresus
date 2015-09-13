let americano = require('../db').module;

let Category = americano.getModel('bankcategory', {
    title: String,
    parentId: String
});

Category.all = function(cb) {
    Category.request("all", cb);
}

export default Category;
