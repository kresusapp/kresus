/**
 * Categories API endpoints
 */
import selfapi from 'selfapi';

import * as categoriesControllers from '../categories';

const categories = selfapi({
    title: 'Categories'
});

categories.get({
    title: 'List all categories',
    handler: categoriesControllers.getAllCategories,
    examples: [{
        response: {
            status: 200,
            body: {
                data: {
                    categories: [{
                        title: 'toto',
                        color: '#fd3b2f',
                        threshold: 0,
                        id: 'f04ea1953b6a4959aff2161325a722b4'
                    }]
                }
            }
        }
    }]
});
categories.post({
    title: 'Create a new category',
    handler: categoriesControllers.create,
    examples: [{
        request: {
            body: {
                title: 'foobar',
                color: '#a31c70'
            }
        },
        response: {
            status: 201,
            body: {
                data: {
                    id: 'd7d50ad4bca04545809ebaa466b44028'
                }
            }
        }
    }]
});

const category = categories.api('/:categoryId');
category.get({
    title: 'Get a given category',
    handler: categoriesControllers.getCategory,
    examples: [{
        request: {
            urlParameters: {
                categoryId: 'd7d50ad4bca04545809ebaa466b44028'
            }
        },
        response: {
            status: 200,
            body: {
                data: {
                    category: {
                        title: 'foobar',
                        color: '#a31c70',
                        threshold: 0,
                        id: 'd7d50ad4bca04545809ebaa466b44028'
                    }
                }
            }
        }
    }]
});
category.put({
    title: 'Edit a given category',
    handler: categoriesControllers.update,
    examples: [{
        request: {
            body: {
                title: 'foobar2'
            },
            urlParameters: {
                categoryId: 'd7d50ad4bca04545809ebaa466b44028'
            }
        },
        response: {
            status: 200,
            body: {
                data: {
                    id: 'd7d50ad4bca04545809ebaa466b44028'
                }
            }
        }
    }]
});
category.delete({
    title: 'Delete a given category',
    handler: categoriesControllers.destroy,
    examples: [{
        request: {
            urlParameters: {
                categoryId: 'd7d50ad4bca04545809ebaa466b44028'
            }
        },
        response: {
            status: 204
        }
    }]
});

export const paramsRoutes = {
    categoryId: categoriesControllers.preloadCategory
};

export default categories;
