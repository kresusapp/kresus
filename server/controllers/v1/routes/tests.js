/**
 * API tests endpoints
 */
import selfapi from 'selfapi';

import * as settingsControllers from '../settings';

const tests = selfapi({
    title: 'Tests'
});

// TODO
const testSendMail = tests.api('/send-email');
testSendMail.post({
    title: 'Test email sending',
    description: 'Check that the Kresus instance can send email',
    handler: settingsControllers.testEmail,
    examples: [{
        request: {
            body: {
                config: {
                    fromEmail: "kresus@example.com",
                    toEmail: "myself@example.com",
                    host: "localhost",
                    port: "587",
                    secure: true,
                    auth: {
                        user: "some_login",
                        pass: "123456"
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                }
            }
        },
        response: {
            status: 200,
            body: {
                data: {
                    status: 'OK'
                }
            }
        }
    }]
});

export default tests;
