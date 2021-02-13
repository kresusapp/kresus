import React from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

import URL from '../../urls';
import { get, actions } from '../../store';
import { translate as $t } from '../../helpers';

import InOutChart from './in-out-chart';
import BalanceChart from './balance-chart';
import CategoryCharts from './category-charts';
import { MODAL_SLUG } from './default-params-modal';

import TabsContainer from '../ui/tabs';
import { ViewContext, DriverType } from '../drivers';

import { DARK_MODE, DEFAULT_CHART_DISPLAY_TYPE } from '../../../shared/settings';

import 'c3/c3.css';
import './charts.css';

const ShowParamsButton = connect(null, dispatch => {
    return {
        handleClick() {
            actions.showModal(dispatch, MODAL_SLUG);
        },
    };
})(props => (
    <button className="btn" onClick={props.handleClick}>
        <span>{$t('client.general.default_parameters')}</span>
    </button>
));

const ChartsComponent = props => {
    const location = useLocation();
    let { view, theme, transactions, defaultDisplay, accessId } = props;

    const makeAllCharts = () => <CategoryCharts transactions={transactions} />;
    const makeBalanceCharts = () => (
        <BalanceChart
            transactions={transactions}
            initialBalance={view.initialBalance}
            theme={theme}
        />
    );

    let tabs = new Map();
    tabs.set(URL.charts.url('all', view.driver), {
        name: $t('client.charts.by_category'),
        component: makeAllCharts,
    });
    tabs.set(URL.charts.url('balance', view.driver), {
        name: $t('client.charts.balance'),
        component: makeBalanceCharts,
    });

    if (view.driver.type === DriverType.Account) {
        const makePosNegChart = () => <InOutChart accessId={accessId} theme={theme} />;

        tabs.set(URL.charts.url('earnings', view.driver), {
            name: $t('client.charts.differences_all'),
            component: makePosNegChart,
        });
    }

    return (
        <div className="charts">
            <p className="buttons-toolbar">
                <ShowParamsButton />
            </p>

            <TabsContainer
                tabs={tabs}
                defaultTab={URL.charts.url(defaultDisplay, view.driver)}
                selectedTab={location.pathname}
            />
        </div>
    );
};

ChartsComponent.propTypes = {
    // The kind of chart to display: by categories, balance, or in and outs for all accounts.
    defaultDisplay: PropTypes.string.isRequired,

    // The current view.
    view: PropTypes.object.isRequired,

    // The transactions for the current account.
    transactions: PropTypes.array.isRequired,

    // The current theme.
    theme: PropTypes.string.isRequired,
};

const ConnectedWrapper = connect((state, ownProps) => {
    const { currentView } = ownProps;
    let transactions = currentView.transactions;
    let defaultDisplay = get.setting(state, DEFAULT_CHART_DISPLAY_TYPE);
    let theme = get.boolSetting(state, DARK_MODE) ? 'dark' : 'light';
    let accessId =
        currentView.driver.type === DriverType.Account
            ? get.accessByAccountId(state, Number.parseInt(currentView.driver.value, 10)).id
            : null;

    return {
        defaultDisplay,
        view: currentView,
        transactions,
        theme,
        accessId,
    };
})(ChartsComponent);

// Temporary wrapper: we should use `useContext` in the future.
class Export extends React.Component {
    static contextType = ViewContext;
    render() {
        return <ConnectedWrapper currentView={this.context} />;
    }
}

export default Export;
