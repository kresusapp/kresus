import { useContext } from 'react';
import type { DuplicatesByAccount } from '../../../shared/types';
import { translate as $t } from '../../helpers';
import { Transaction } from '../../models';
import { GlobalState, useKresusState } from '../../store';
import * as BanksStore from '../../store/banks';
import * as DuplicatesStore from '../../store/duplicates';
import { Driver, DriverContext } from '../drivers';
import { LoadingMessage } from '../overlay/loading';
import Pair from './item';

function toTransactionPairs(state: GlobalState, accountDuplicates: DuplicatesByAccount) {
    return accountDuplicates.flatMap(item => {
        return item.duplicates.map(dup => [
            BanksStore.transactionById(state.banks, dup[0]),
            BanksStore.transactionById(state.banks, dup[1]),
        ]);
    });
}

export function findRedundantPairs(state: GlobalState, accountId: number) {
    return toTransactionPairs(state, DuplicatesStore.byAccountId(state.duplicates, accountId));
}

export function findIgnoredPairs(state: GlobalState, accountId: number) {
    return toTransactionPairs(
        state,
        DuplicatesStore.ignoredByAccountId(state.duplicates, accountId)
    );
}

// Maps each account of the current view which has pairs to display to its pairs of transactions.
export function usePairsByAccount(driver: Driver, ignored: boolean) {
    return useKresusState(state => {
        const mapping = new Map<string, Transaction[][]>();
        driver.getAccounts(state).forEach(account => {
            const accPairs = ignored
                ? findIgnoredPairs(state, account.id)
                : findRedundantPairs(state, account.id);
            if (accPairs.length) {
                mapping.set(account.customLabel || account.label, accPairs);
            }
        });
        return mapping;
    });
}

const PairsList = (props: {
    pairsByAccount: Map<string, Transaction[][]>;
    // When set, the pairs are ones the user chose to ignore: they can only be un-ignored.
    ignored: boolean;
    // Message displayed when there are no pairs at all.
    emptyMessage: string;
}) => {
    const driver = useContext(DriverContext);
    const formatCurrency = useKresusState(state => driver.getCurrencyFormatter(state));
    const isLoaded = useKresusState(state => DuplicatesStore.isLoaded(state.duplicates));

    const { pairsByAccount, ignored } = props;

    if (!isLoaded) {
        // Duplicates are lazy-loaded to speed-up the initial /all request.
        return (
            <LoadingMessage message={$t('client.similarity.loading_duplicates')} inline={true} />
        );
    }

    if (pairsByAccount.size === 0) {
        return <div>{props.emptyMessage}</div>;
    }

    const content = [];
    for (const [accountLabel, pairs] of pairsByAccount) {
        // If there are several accounts, display the account's label before the duplicates.
        if (pairsByAccount.size > 1) {
            content.push(<h3 key={`account-${accountLabel}`}>{accountLabel}</h3>);
        }

        content.push(
            ...pairs.map(p => {
                const key = `${p[0].id}-${p[1].id}`;
                return (
                    <Pair
                        key={key}
                        toKeep={p[0]}
                        toRemove={p[1]}
                        formatCurrency={formatCurrency}
                        ignored={ignored}
                    />
                );
            })
        );
    }

    return <>{content}</>;
};

PairsList.displayName = 'PairsList';

export default PairsList;
