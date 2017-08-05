/**
 * API endpoints
 */
import selfapi from 'selfapi';

import * as operationsControllers from '../operations';

const operations = selfapi({
    title: 'Operations'
});

operations.get({
    title: 'List all operations',
    handler: (request, reponse) => {
        // TODO
    },
    examples: [{
        response: {
            status: 200,
            body: {
                data: {
                    operations: [{
                        bankAccount: '102test101491',
                        type: 'type.deposit',
                        title: 'Croisement CB',
                        raw: 'Courses chez Croisement',
                        date: '2017-04-12T00:00:00.000Z',
                        dateImport: '2017-07-27T13:30:59.000Z',
                        amount: -30.2,
                        id: 'ddac9a0451894576803422979c2358ad'
                    }]
                }
            }
        }
    }]
});
operations.post({
    title: 'Create a new operation',
    handler: operationsControllers.create,
    examples: [{
        request: {
            body: {
                date: '2017-07-27T00:00:00.000Z',
                title: 'I lose money',
                amount: -30,
                categoryId: '-1',
                type: 'type.card',
                bankAccount: '102test101491'
            }
        },
        response: {
            status: 201,
            body: {
                data: {
                    id: 'c38fc2d60d254e7d8331f87f342d907a'
                }
            }
        }
    }]
});

const operation = operations.api('/:operationId');
operation.get({
    title: 'Get a given operation',
    handler: (request, reponse) => {
        // TODO
    },
    examples: [{
        request: {
            urlParameters: {
                operationId: 'ddac9a0451894576803422979c2358ad'
            }
        },
        response: {
            status: 200,
            body: {
                data: {
                    operation: {
                        bankAccount: '102test101491',
                        type: 'type.deposit',
                        title: 'Croisement CB',
                        raw: 'Courses chez Croisement',
                        date: '2017-04-12T00:00:00.000Z',
                        dateImport: '2017-07-27T13:30:59.000Z',
                        amount: -30.2,
                        id: 'ddac9a0451894576803422979c2358ad'
                    }
                }
            }
        }
    }]
});
operation.put({
    title: 'Edit a given operation',
    handler: operationsControllers.update,
    examples: [{
        request: {
            urlParameters: {
                operationId: 'c38fc2d60d254e7d8331f87f342d907a'
            },
            body: {
                title: 'I win money',
                amount: 30
            }
        },
        response: {
            status: 201,
            body: {
                data: {
                    id: 'c38fc2d60d254e7d8331f87f342d907a'
                }
            }
        }
    }]
});
operation.delete({
    title: 'Delete a given operation',
    handler: operationsControllers.destroy,
    examples: [{
        request: {
            urlParameters: {
                operationId: 'ddac9a0451894576803422979c2358ad'
            }
        },
        response: {
            status: 204
        }
    }]
});

const operationMergeWithAPI = operation.api('/mergeWith/:otherOperationId');
operationMergeWithAPI.put({
    title: 'Merge two operations together',
    handler: operationsControllers.merge,
    examples: [{
        request: {
            urlParameters: {
                operationId: 'ddac9a0451894576803422979c2358ad',
                otherOperationId: 'c38fc2d60d254e7d8331f87f342d907a'
            }
        },
        response: {
            status: 200,
            body: {
                data: {
                    id: 'ddac9a0451894576803422979c2358ad'
                }
            }
        }
    }]
});

const operationFileAPI = operation.api('/:file');
operationFileAPI.get({
    title: 'TODO',
    handler: operationsControllers.file,
    examples: [
        // TODO: Examples
    ]
});

export const paramsRoutes = {
    operationId: operationsControllers.preloadOperation,
    otherOperationId: operationsControllers.preloadOtherOperation
};

export default operations;
