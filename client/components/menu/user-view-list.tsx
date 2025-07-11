import React from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';

import { useKresusState } from '../../store';
import * as ViewsStore from '../../store/views';
import URL from '../../urls';
import { DriverAccount } from '../drivers/account';
import { DriverType } from '../drivers';
import { translate as $t } from '../../helpers';
import ColoredAmount from '../ui/colored-amount';
import DisplayIf from '../ui/display-if';

const UserViewList = () => {
    const views = useKresusState(state => ViewsStore.allUserViews(state.views));
    const { pathname } = useLocation();
    const { driver = null, value } = useParams<{ driver?: string; value: string }>();

    const viewsItems = useKresusState(state => {
        return views.map(view => {
            const accountDriver = new DriverAccount(view.id);
            const currencyFormatter = accountDriver.getCurrencyFormatter(state);
            const outstandingSum = accountDriver.getOutstandingSum(state);

            const newPathname =
                driver !== null
                    ? pathname
                          .replace(driver, DriverType.Account)
                          .replace(value, view.id.toString())
                    : URL.reports.url(accountDriver);

            return (
                <li key={`view-list-item-${view.id}`}>
                    <NavLink to={newPathname} activeClassName="active">
                        <span>{view.label}</span>
                        &nbsp;
                        <ColoredAmount
                            amount={accountDriver.getBalance(state)}
                            formatCurrency={currencyFormatter}
                        />
                        <DisplayIf condition={outstandingSum !== 0}>
                            &ensp;
                            {`(${$t('client.menu.outstanding_sum')}: `}
                            <ColoredAmount
                                amount={outstandingSum}
                                formatCurrency={currencyFormatter}
                            />
                            {')'}
                        </DisplayIf>
                    </NavLink>
                </li>
            );
        });
    });

    let content = <p>{$t('client.settings.views.none')}</p>;

    if (viewsItems.length) {
        content = <ul className="views-list">{viewsItems}</ul>;
    }

    return (
        <div className="views-details">
            <h3>
                <span>{$t('client.settings.views.title')}</span>
                <NavLink to={URL.settings.url('views')}>
                    <span className="fa fa-cog" title={$t('client.settings.views.manage')} />
                </NavLink>
            </h3>
            {content}
        </div>
    );
};

UserViewList.displayName = 'UserViewList';

export default UserViewList;
