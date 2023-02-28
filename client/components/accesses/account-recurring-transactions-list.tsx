import React, { useCallback, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { fetchRecurringTransactions } from '../../store/backend';

import { RecurringTransaction } from '../../models';

import { translate as $t } from '../../helpers';

import { useGenericError } from '../../hooks';

import DisplayIf from '../ui/display-if';
import ButtonLink from '../ui/button-link';
import BackLink from '../ui/back-link';

import RecurringTransactionItem from './recurring-transaction-item';

import URL from './urls';

const RecurringTransactionsList = () => {
    const { accountId: accountIdStr } = useParams<{ accountId: string }>();
    const accountId = Number.parseInt(accountIdStr, 10);

    const [recurringTransactions, setRecurringTransactions] = useState([]);
    const fetch = useGenericError(
        useCallback(async () => {
            const results = await fetchRecurringTransactions(accountId);
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
            <p>
                <BackLink to={URL.accessList}>{$t('client.accesses.back_to_access_list')}</BackLink>
            </p>

            <p>
                <ButtonLink
                    to={URL.newAccountRecurringTransaction(accountId)}
                    aria={$t('client.recurring_transactions.new')}
                    label={$t('client.recurring_transactions.new')}
                    icon="plus"
                />
            </p>
            <hr />

            <p className="alerts info">{$t('client.recurring_transactions.explanation')}</p>

            <DisplayIf condition={!recurringTransactions.length}>
                <p>{$t('client.recurring_transactions.none')}</p>
            </DisplayIf>
            <DisplayIf condition={recurringTransactions.length > 0}>
                <table className="no-vertical-border recurring-transactions-list">
                    <thead>
                        <tr>
                            <th className="label">{$t('client.addoperation.label')}</th>
                            <th className="type">{$t('client.addoperation.type')}</th>
                            <th className="amount">{$t('client.addoperation.amount')}</th>
                            <th className="day">{$t('client.recurring_transactions.day')}</th>
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
