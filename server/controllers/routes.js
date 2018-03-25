import manifestRoute from './manifest';
import apiV1Routes from './v1/routes';

module.exports = Object.assign({}, manifestRoute, apiV1Routes);
