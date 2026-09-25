import { useContext } from 'react';
import { NavLink, useLocation } from 'react-router';
import { translate as $t } from '../../helpers';
import { useKresusState } from '../../store';
import * as ViewsStore from '../../store/views';
import URL from '../../urls';
import { DriverContext, DriverType } from '../drivers';
import { DriverCurrency } from '../drivers/currency';
import ColoredAmount from '../ui/colored-amount';
import DisplayIf from '../ui/display-if';

// Show a list of views, per currency.
const CurrencyViewList = () => {
    const { pathname } = useLocation();
    const currentDriver = useContext(DriverContext);

    const viewsItems = useKresusState(state => {
        return ViewsStore.allCurrencyViews(state.views).map(view => {
            if (!view.currency) {
                return null;
            }

            // For these views, exclude accounts that should be excluded from the total balance as
            // well.
            const excludeMarkedAccountsFromBalance = true;

            const currencyDriver = new DriverCurrency(view.currency);
            const currencyFormatter = currencyDriver.getCurrencyFormatter(state);
            const outstandingSum = currencyDriver.getOutstandingSum(
                state,
                excludeMarkedAccountsFromBalance
            );

            const newPathname =
                currentDriver.type !== DriverType.None
                    ? pathname
                          .replace(currentDriver.type, DriverType.Currency)
                          .replace(currentDriver.value!, view.currency)
                    : URL.reports.url(currencyDriver);

            return (
                <li key={`view-list-item-${view.currency}`}>
                    <NavLink to={newPathname}>
                        <span>{view.label}</span>
                        &nbsp;
                        <ColoredAmount
                            amount={currencyDriver.getBalance(
                                state,
                                excludeMarkedAccountsFromBalance
                            )}
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
                <span>{$t('client.settings.views.overall')}</span>
            </h3>
            {content}
        </div>
    );
};

CurrencyViewList.displayName = 'CurrencyViewList';

export default CurrencyViewList;
