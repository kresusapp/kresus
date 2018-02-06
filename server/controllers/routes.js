import manifestRoute from './manifest';
import logs from './logs';
import apiV1Routes from './v1/routes';

module.exports = Object.assign({}, logs, manifestRoute, apiV1Routes);
