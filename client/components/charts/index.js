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
import withDriver from '../withDriver';

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
    let { view, theme, operations, defaultDisplay } = props;

    const makeAllCharts = () => <CategoryCharts operations={operations} />;
    const makeBalanceCharts = () => (
        <BalanceChart operations={operations} initialBalance={view.initialBalance} theme={theme} />
    );
    const makePosNegChart = () => <InOutChart view={view} operations={operations} theme={theme} />;

    let tabs = new Map();
    tabs.set(URL.charts.url('all', view.driver), {
        name: $t('client.charts.by_category'),
        component: makeAllCharts,
    });
    tabs.set(URL.charts.url('balance', view.driver), {
        name: $t('client.charts.balance'),
        component: makeBalanceCharts,
    });
    tabs.set(URL.charts.url('earnings', view.driver), {
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
                defaultTab={URL.charts.url(defaultDisplay, view.driver)}
                selectedTab={location.pathname}
            />
        </div>
    );
};

ChartsComponent.propTypes = {
    // The kind of chart to display: by categories, balance, or in and outs for all accounts.
    defaultDisplay: PropTypes.string.isRequired,

    // The current driver.
    view: PropTypes.object.isRequired,

    // The operations for the current account.
    operations: PropTypes.array.isRequired,

    // The current theme.
    theme: PropTypes.string.isRequired,
};

const Export = connect((state, ownProps) => {
    const { currentView } = ownProps;
    let operations = currentView.operations;
    let defaultDisplay = get.setting(state, DEFAULT_CHART_DISPLAY_TYPE);
    let theme = get.boolSetting(state, DARK_MODE) ? 'dark' : 'light';

    return {
        defaultDisplay,
        view: currentView,
        operations,
        theme,
    };
})(ChartsComponent);

export default withDriver(Export);
