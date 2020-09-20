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
import withCurrentAccountId from '../withCurrentAccountId';

import { DARK_MODE, DEFAULT_CHART_DISPLAY_TYPE } from '../../../shared/settings';

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
    let { account, theme, operations, defaultDisplay } = props;

    const makeAllCharts = () => <CategoryCharts operations={operations} />;
    const makeBalanceCharts = () => (
        <BalanceChart operations={operations} account={account} theme={theme} />
    );
    const makePosNegChart = () => <InOutChart accessId={account.accessId} theme={theme} />;

    const currentAccountId = account.id;

    let tabs = new Map();
    tabs.set(URL.charts.url('all', currentAccountId), {
        name: $t('client.charts.by_category'),
        component: makeAllCharts,
    });
    tabs.set(URL.charts.url('balance', currentAccountId), {
        name: $t('client.charts.balance'),
        component: makeBalanceCharts,
    });
    tabs.set(URL.charts.url('earnings', currentAccountId), {
        name: $t('client.charts.differences_all'),
        component: makePosNegChart,
    });

    return (
        <div className="charts">
            <p className="buttons-toolbar">
                <ShowParamsButton />
            </p>

            <TabsContainer
                tabs={tabs}
                defaultTab={URL.charts.url(defaultDisplay, currentAccountId)}
                selectedTab={location.pathname}
            />
        </div>
    );
};

ChartsComponent.propTypes = {
    // The kind of chart to display: by categories, balance, or in and outs for all accounts.
    defaultDisplay: PropTypes.string.isRequired,

    // The current account.
    account: PropTypes.object.isRequired,

    // The operations for the current account.
    operations: PropTypes.array.isRequired,

    // The current theme.
    theme: PropTypes.string.isRequired,
};

const Export = connect((state, ownProps) => {
    let { currentAccountId } = ownProps;
    let account = get.accountById(state, currentAccountId);
    let operations = get.operationsByAccountId(state, currentAccountId);
    let defaultDisplay = get.setting(state, DEFAULT_CHART_DISPLAY_TYPE);
    let theme = get.boolSetting(state, DARK_MODE) ? 'dark' : 'light';

    return {
        defaultDisplay,
        account,
        operations,
        theme,
    };
})(ChartsComponent);

export default withCurrentAccountId(Export);
