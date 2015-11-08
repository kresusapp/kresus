import {JsonClient as Client} from 'request-json';

import {promisify} from '../helpers';

let log = require('printit')({
    prefix: 'emailer',
    date: true
});

const DATA_SYSTEM_URL = "http://localhost:9101/";

class Emailer
{
    constructor() {
        this.client = new Client(DATA_SYSTEM_URL);
        this.client.post = promisify(::this.client.post);

        if (process.kresus.standalone) {
            log.warn("email sender not implemented yet in standalone mode");
        } else if (process.kresus.prod) {
            this.client.setBasicAuth(process.env.NAME, process.env.TOKEN);
        }
    }

    // opts = {from, subject, content, html}
    async sendToUser(opts) {

        if (process.kresus.standalone) {
            return log.warn("Trying to send email in standalone mode, where email is NYI.");
        }

        opts.from = opts.from || "Kresus <kresus-noreply@cozycloud.cc>";
        if (!opts.subject)
            return log.warn("Emailer.send API misuse: subject is required");
        if (!opts.content && !opts.html)
            return log.warn("Emailer.send API misuse: either content or html is required");
        await this.client.post("mail/to-user/", opts);
    }
};

export default new Emailer;
