/**
 * Alert API endpoints
 */
import selfapi from 'selfapi';

import * as alertsControllers from '../alerts';

const alerts = selfapi({
    title: 'Alerts'
});

alerts.get({
    title: 'List all alerts',
    handler: (request, response) => {
        // TODO
    },
    examples: [{
        response: {
            status: 200,
            body: {
                data: {
                    alerts: [
                        {
                            bankAccount: '102test101494',
                            type: 'balance',
                            limit: 100,
                            order: 'gt',
                            id: 'bb90aae4d61e4fdd9c2cee8190e1ba4b'
                        }
                    ]
                }
            }
        }
    }]
});
alerts.post({
    title: 'Create a new alert on your bank accounts',
    handler: alertsControllers.create,
    examples: [{
        request: {
            body: {
                type: 'balance',
                limit: 200,
                order: 'lt',
                bankAccount: '102test101491'
            }
        },
        response: {
            status: 201,
            body: {
                data: {
                    id: '93d99bfaa2284e889c4a17ebc6d5498a'
                }
            }
        }
    }]
});

const alert = alerts.api('/:alertId');
alert.get({
    title: 'Get a given alert',
    handler: (request, response) => {
        // TODO
    },
    examples: [{
        request: {
            urlParameters: {
                alertId: 'bb90aae4d61e4fdd9c2cee8190e1ba4b'
            }
        },
        response: {
            status: 200,
            body: {
                data: {
                    alert: {
                        bankAccount: '102test101494',
                        type: 'balance',
                        limit: 100,
                        order: 'gt',
                        id: 'bb90aae4d61e4fdd9c2cee8190e1ba4b'
                    }
                }
            }
        }
    }]
});
alert.put({
    title: 'Edit a given alert on your bank accounts',
    handler: alertsControllers.update,
    examples: [{
        request: {
            urlParameters: {
                alertId: 'bb90aae4d61e4fdd9c2cee8190e1ba4b'
            },
            body: {
                limit: 150
            }
        },
        response: {
            status: 200,
            body: {
                data: {
                    id: 'bb90aae4d61e4fdd9c2cee8190e1ba4b'
                }
            }
        }
    }]
});
alert.delete({
    title: 'Delete a given alert on your bank accounts',
    handler: alertsControllers.destroy,
    examples: [{
        request: {
            urlParameters: {
                alertId: 'bb90aae4d61e4fdd9c2cee8190e1ba4b'
            }
        },
        response: {
            status: 204
        }
    }]
});

export const paramsRoutes = {
    alertId: alertsControllers.loadAlert
};

export default alerts;
