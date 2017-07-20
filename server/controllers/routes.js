import buildAPIv1Routes from './v1/routes';

export default function (app) {
    // Push API v1 routes
    buildAPIv1Routes(app);
};
