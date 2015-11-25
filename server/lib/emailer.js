import cozydb from 'cozydb';
import {makeLogger, promisify} from '../helpers';

let log = makeLogger('emailer');

class Emailer
{
    constructor() {
        if (process.kresus.standalone) {
            this.internalSendToUser = promisify(function(opts, cb) {
                log.warn("Trying to send email in standalone mode, where email is NYI.");
                cb(null);
            });
        } else {
            this.internalSendToUser = promisify(::cozydb.api.sendMailToUser);
        }
    }

    // opts = {from, subject, content, html}
    async sendToUser(opts) {
        opts.from = opts.from || "Kresus <kresus-noreply@cozycloud.cc>";
        if (!opts.subject)
            return log.warn("Emailer.send API misuse: subject is required");
        if (!opts.content && !opts.html)
            return log.warn("Emailer.send API misuse: either content or html is required");
        await this.internalSendToUser(opts);
    }
};

export default new Emailer;
