// This modules implements a manual access where the user fills the transactions themselves.
import { nameToId as accountTypeNameToId } from '../../models/accounttype';
import { translate as $t } from '../../helpers';

export const SOURCE_NAME = 'manual';

export const fetchAccounts = async function() {
    const manualAccountTitle = $t('server.banks.manual_account');
    const unknownTypeId = accountTypeNameToId('account-type.unknown');
    return [
        {
            accountNumber: '1',
            title: `${manualAccountTitle} #1 (EUR)`,
            balance: 0,
            currency: 'EUR',
            type: unknownTypeId
        },
        {
            accountNumber: '2',
            title: `${manualAccountTitle} #2 (EUR)`,
            balance: 0,
            currency: 'EUR',
            type: unknownTypeId
        },
        {
            accountNumber: '3',
            title: `${manualAccountTitle} #3 (USD)`,
            balance: 0,
            currency: 'USD',
            type: unknownTypeId
        }
    ];
};

export const fetchOperations = () => {
    return new Promise(accept => {
        accept([]);
    });
};
