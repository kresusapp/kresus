import React, { useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import * as BanksStore from '../../store/banks';
import { useKresusState } from '../../store';
import * as UiStore from '../../store/ui';

import { RecurringTransaction } from '../../models';

import { translate as $t } from '../../helpers';

import DisplayIf, { IfMobile, IfNotMobile } from '../ui/display-if';
import ButtonLink from '../ui/button-link';

import RecurringTransactionItem, {
    SwipeableRecurringTransactionItem,
} from './recurring-transaction-item';

import URL from '../../urls';

const RecurringTransactionsList = () => {
    const history = useHistory();
    const isSmallScreen = useKresusState(state => UiStore.isSmallScreen(state.ui));

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

    const recurringTransactions = useKresusState(state => {
        const rt = BanksStore.getRecurringTransactionsByAccountId(state.banks, accountId);
        return rt.slice().sort((a, b) => {
            return a.dayOfMonth - b.dayOfMonth || a.label.localeCompare(b.label);
        });
    });

    useEffect(() => {
        if (!account) {
            history.push(URL.recurringTransactions.pattern);
        }
    }, [account, recurringTransactions, history]);

    if (!account) {
        return null;
    }

    const Item = isSmallScreen ? SwipeableRecurringTransactionItem : RecurringTransactionItem;

    const recurringTransactionsItems = recurringTransactions.map((rt: RecurringTransaction) => (
        <Item key={rt.id} recurringTransaction={rt} currency={account.currency} />
    ));

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
                <div className="swipeable-table-wrapper">
                    <table className="swipeable-table striped no-vertical-border no-horizontal-border recurring-transactions-list">
                        <thead>
                            <tr>
                                <IfMobile>
                                    <th className="swipeable-action swipeable-action-left" />
                                </IfMobile>
                                <th className="label">{$t('client.addtransaction.label')}</th>
                                <th className="type">{$t('client.addtransaction.type')}</th>
                                <th className="amount">{$t('client.addtransaction.amount')}</th>
                                <th className="day">{$t('client.recurring_transactions.day')}</th>
                                <th className="months">
                                    {$t('client.recurring_transactions.months')}
                                </th>
                                <IfNotMobile>
                                    <th className="actions" colSpan={2}>
                                        &nbsp;
                                    </th>
                                </IfNotMobile>
                                <IfMobile>
                                    <th className="swipeable-action swipeable-action-right" />
                                </IfMobile>
                            </tr>
                        </thead>
                        <tbody>{recurringTransactionsItems}</tbody>
                    </table>
                </div>
            </DisplayIf>
        </>
    );
};

RecurringTransactionsList.displayName = 'RecurringTransactionsList';

export default RecurringTransactionsList;
