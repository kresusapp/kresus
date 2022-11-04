// This modules implements a manual access where the user fills the transactions themselves.

import { accountTypeNameToId } from '../lib/account-types';
import { translate as $t } from '../helpers';
import {
    FetchAccountsOptions,
    Provider,
    ProviderAccountResponse,
    ProviderTransactionResponse,
} from '.';
import { getTranslator } from '../lib/translator';

export const SOURCE_NAME = 'manual';

export const fetchAccounts = async (
    opts: FetchAccountsOptions
): Promise<ProviderAccountResponse> => {
    const accessCurrencyField = opts.access.fields.find(f => f.name === 'currency');
    const currency = accessCurrencyField ? accessCurrencyField.value : 'EUR';
    const i18n = await getTranslator(opts.access.userId);
    const manualAccountLabel = $t(i18n, 'server.banks.manual_account');
    const unknownTypeId = accountTypeNameToId('account-type.unknown');
    return {
        kind: 'values',
        values: [
            {
                vendorAccountId: '1',
                label: `${manualAccountLabel} #1 (${currency})`,
                // No balance
                currency,
                type: unknownTypeId,
            },
            {
                vendorAccountId: '2',
                label: `${manualAccountLabel} #2 (${currency})`,
                // No balance
                currency,
                type: unknownTypeId,
            },
            {
                vendorAccountId: '3',
                label: `${manualAccountLabel} #3 (${currency})`,
                // No balance
                currency,
                type: unknownTypeId,
            },
        ],
    };
};

export const fetchOperations = (): Promise<ProviderTransactionResponse> => {
    return Promise.resolve({ kind: 'values', values: [] });
};

export const _: Provider = {
    SOURCE_NAME,
    fetchAccounts,
    fetchOperations,
};
