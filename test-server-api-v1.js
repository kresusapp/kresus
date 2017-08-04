import v1API from './server/controllers/v1/routes/definitions';

const mockApp = null;
const mockControllers = {
    accesses: {},
    accounts: {},
    operations: {},
    alerts: {},
    categories: {},
    settings: {},
    all: {}
};


v1API(mockApp, mockControllers).test(
    'http://localhost:9876',
    function (error, results) {
        if (error) {
            console.error(error);
            return;
        }
        if (results.passed.length !== 4 || results.failed.length !== 1) {
            throw new Error(
                'Self-test results should include 1 failed and 4 passed: ' +
                    JSON.stringify(results, null, 2));
            return;
        }
    }
);
