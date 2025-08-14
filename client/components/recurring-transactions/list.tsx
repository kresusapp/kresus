import React from 'react';
import { Link } from 'react-router-dom';

import { useKresusState } from '../../store';
import * as BanksStore from '../../store/banks';
import { translate as $t } from '../../helpers';
import URL from '../../urls';
import DisplayIf from '../ui/display-if';

const AccessItem = (props: { id: number }) => {
    const access = useKresusState(state => BanksStore.accessById(state.banks, props.id));
    const accountsIds = useKresusState(state =>
        BanksStore.accountIdsByAccessId(state.banks, access.id)
    );
    const accounts = useKresusState(state => {
        return accountsIds.map(accountId => BanksStore.accountById(state.banks, accountId));
    });

    return (
        <table className="no-vertical-border no-hover bank-accounts-list">
            <caption>
                <div>
                    <DisplayIf condition={!access.isBankVendorDeprecated}>
                        <div className={`icon icon-${access.vendorId}`} />
                    </DisplayIf>
                    <h3>{access.label}</h3>
                </div>
            </caption>
            <tbody>
                {accounts.map(account => (
                    <tr key={`settings-bank-accesses-account-${account.id}`}>
                        <td className="account-label">
                            <div>
                                <Link to={URL.accountRecurringTransactions.url(account.id)}>
                                    <span>{account.customLabel || account.label}</span>
                                    <span className="fa fa-chevron-right" />
                                </Link>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const List = () => {
    const accessesIds = useKresusState(state => BanksStore.getAccessIds(state.banks));

    return (
        <div className="recurring-transactions-list-all">
            <h3>{$t('client.menu.recurring-transactions')}</h3>
            <p className="alerts info">{$t('client.recurring_transactions.explanation')}</p>

            <p className="recurring-transactions-select-text">
                {$t('client.recurring_transactions.select_account')}
            </p>
            {accessesIds.map(id => (
                <AccessItem key={id} id={id} />
            ))}
        </div>
    );
};

export default List;
