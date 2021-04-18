import URL from '../../urls';
import { Driver } from '../drivers';

const BASE = URL.transactions.pattern;

export default {
    details: {
        pattern: `${BASE}/:transactionId`,
        url(driver: Driver, transactionId: number) {
            return `${URL.transactions.url(driver)}/${transactionId}`;
        },
    },

    new: {
        pattern: `${BASE}/new`,
        url(driver: Driver) {
            return `${URL.transactions.url(driver)}/new`;
        },
    },
};
