import React, { useCallback, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import * as BanksStore from '../../store/banks';
import { useKresusState } from '../../store';
import { fetchRecurringTransactions } from '../../store/backend';

import { RecurringTransaction } from '../../models';

import { assert, translate as $t } from '../../helpers';

import { useGenericError } from '../../hooks';

import DisplayIf from '../ui/display-if';
import ButtonLink from '../ui/button-link';

import RecurringTransactionItem from './recurring-transaction-item';

import URL from '../../urls';

const RecurringTransactionsList = () => {
    const { accountId: accountIdStr } = useParams<{
        accountId: string;
    }>();

    const accountId = Number.parseInt(accountIdStr, 10);

    const account = useKresusState(state => {
        if (Number.isNaN(accountId)) {
            return null;
        }

        if (!BanksStore.accountExists(state.banks, accountId)) {
            // Zombie!
            return null;
        }
        return BanksStore.accountById(state.banks, accountId);
    });

    assert(account !== null, 'Account id not provided or incorrect');

    const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
    const fetch = useGenericError(
        useCallback(async () => {
            const results = (await fetchRecurringTransactions(accountId)) as RecurringTransaction[];
            results.sort((a, b) => {
                return a.dayOfMonth - b.dayOfMonth || a.label.localeCompare(b.label);
            });
            setRecurringTransactions(results);
        }, [accountId])
    );

    const onItemDeleted = useCallback(
        (id: number) => {
            const index = recurringTransactions.findIndex(
                (rt: RecurringTransaction) => rt.id === id
            );
            if (index > -1) {
                const newList = recurringTransactions.slice();
                newList.splice(index, 1);
                setRecurringTransactions(newList);
            }
        },
        [recurringTransactions, setRecurringTransactions]
    );

    const recurringTransactionsItems = recurringTransactions.map((rt: RecurringTransaction) => (
        <RecurringTransactionItem key={rt.id} recurringTransaction={rt} onDelete={onItemDeleted} />
    ));

    // On mount, fetch the recurring transactions.
    useEffect(() => {
        void fetch();
    }, [fetch]);

    return (
        <>
            <h3>{account.customLabel || account.label}</h3>

            <p>
                <ButtonLink
                    to={URL.newAccountRecurringTransaction.url(accountId)}
                    aria={$t('client.recurring_transactions.new')}
                    label={$t('client.recurring_transactions.new')}
                    icon="plus"
                />
            </p>

            <hr />

            <DisplayIf condition={!recurringTransactions.length}>
                <p className="recurring-transactions-none">
                    <span>{$t('client.recurring_transactions.none')}</span>
                    <span
                        className="tooltipped tooltipped-s multiline"
                        aria-label={$t('client.recurring_transactions.explanation')
                            .split('. ')
                            .join('\n')}>
                        <span className="fa fa-question-circle clickable" />
                    </span>
                </p>
            </DisplayIf>
            <DisplayIf condition={recurringTransactions.length > 0}>
                <table className="no-vertical-border recurring-transactions-list">
                    <thead>
                        <tr>
                            <th className="label">{$t('client.addtransaction.label')}</th>
                            <th className="type">{$t('client.addtransaction.type')}</th>
                            <th className="amount">{$t('client.addtransaction.amount')}</th>
                            <th className="day">{$t('client.recurring_transactions.day')}</th>
                            <th className="months">{$t('client.recurring_transactions.months')}</th>
                            <th className="actions">&nbsp;</th>
                        </tr>
                    </thead>
                    <tbody>{recurringTransactionsItems}</tbody>
                </table>
            </DisplayIf>
        </>
    );
};

RecurringTransactionsList.displayName = 'RecurringTransactionsList';

export default RecurringTransactionsList;
