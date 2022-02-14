import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';

import URL from '../../urls';
import { get } from '../../store';
import { assert, getFontColor, translate as $t, useKresusState } from '../../helpers';

import { Chart as ChartJS, registerables } from 'chart.js';

import chartZoomPlugin from 'chartjs-plugin-zoom';

import InOutChart from './in-out-chart';
import BalanceChart from './balance-chart';
import CategoryCharts from './category-charts';

import TabsContainer, { TabDescriptor } from '../ui/tabs';
import { ViewContext, DriverType } from '../drivers';

import { DARK_MODE, DEFAULT_CHART_DISPLAY_TYPE } from '../../../shared/settings';
import DefaultParameters from './default-params';

import './charts.css';
import { Form } from '../ui';

export const initializeCharts = (function () {
    let initialized = false;
    return () => {
        if (initialized) {
            return;
        }
        ChartJS.register(...registerables);
        ChartJS.register(chartZoomPlugin);
        initialized = true;
    };
})();

initializeCharts();

const Charts = () => {
    const view = useContext(ViewContext);

    const defaultDisplay = useKresusState(state => get.setting(state, DEFAULT_CHART_DISPLAY_TYPE));
    const theme = useKresusState(state => (get.boolSetting(state, DARK_MODE) ? 'dark' : 'light'));
    const accessId = useKresusState(state => {
        if (view.driver.type === DriverType.Account) {
            const accountId = view.driver.value;
            assert(accountId !== null, 'account must be defined in this view');
            return get.accessByAccountId(state, Number.parseInt(accountId, 10)).id;
        }
        return null;
    });

    // Once and for all, define the default text color with respect to the
    // theme.
    ChartJS.defaults.color = getFontColor(theme);

    const location = useLocation();

    const makeByCategoryCharts = () => <CategoryCharts transactions={view.transactions} />;
    const makeBalanceCharts = () => (
        <BalanceChart transactions={view.transactions} balance={view.balance} theme={theme} />
    );

    const tabs = new Map<string, TabDescriptor>();
    tabs.set(URL.charts.url('all', view.driver), {
        name: $t('client.charts.by_category'),
        component: makeByCategoryCharts,
    });
    tabs.set(URL.charts.url('balance', view.driver), {
        name: $t('client.charts.balance'),
        component: makeBalanceCharts,
    });

    if (view.driver.type === DriverType.Account) {
        const makePosNegChart = () => {
            assert(accessId !== null, 'accountId must be defined in this view');
            return <InOutChart accessId={accessId} theme={theme} />;
        };

        tabs.set(URL.charts.url('earnings', view.driver), {
            name: $t('client.charts.differences_all'),
            component: makePosNegChart,
        });
    }

    return (
        <div className="charts">
            <Form.Toolbar align="right">
                <DefaultParameters />
            </Form.Toolbar>

            <TabsContainer
                tabs={tabs}
                defaultTab={URL.charts.url(defaultDisplay, view.driver)}
                selectedTab={location.pathname}
            />
        </div>
    );
};

export default Charts;
