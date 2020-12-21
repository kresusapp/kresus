import URL from '../../urls';

const BASE = URL.transactions.pattern;

export default {
    details: {
        pattern: `${BASE}/:transactionId`,
        url(transactionId: number) {
            return `${BASE}/${transactionId}`;
        },
    },
};
