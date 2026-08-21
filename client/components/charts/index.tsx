import { Chart as ChartJS, registerables } from 'chart.js';
import chartZoomPlugin from 'chartjs-plugin-zoom';
import { useContext } from 'react';
import { useLocation } from 'react-router';
import { DEFAULT_CHART_DISPLAY_TYPE } from '../../../shared/settings';
import { translate as $t, getFontColor } from '../../helpers';
import { useKresusState } from '../../store';
import * as SettingsStore from '../../store/settings';
import URL from '../../urls';
import { DriverContext } from '../drivers';
import TabsContainer, { type TabDescriptor } from '../ui/tabs';
import BalanceChart from './balance-chart';
import CategoryCharts from './category-charts';
import DefaultParameters from './default-params';
import InOutChart from './in-out-chart';
import chartsPlaceholderPlugin from './placeholder-plugin';

import './charts.css';
import { Form } from '../ui';

export const initializeCharts = (() => {
    let initialized = false;
    return () => {
        if (initialized) {
            return;
        }
        ChartJS.register(...registerables);
        ChartJS.register(chartZoomPlugin);
        ChartJS.register(chartsPlaceholderPlugin);
        initialized = true;
    };
})();

initializeCharts();

const Charts = () => {
    const driver = useContext(DriverContext);

    const defaultDisplay = useKresusState(state =>
        SettingsStore.get(state.settings, DEFAULT_CHART_DISPLAY_TYPE)
    );

    // Once and for all, define the default text color with respect to the
    // theme.
    ChartJS.defaults.color = getFontColor();
    ChartJS.defaults.plugins.placeholder.text = $t('client.charts.no_data');

    const location = useLocation();

    const transactions = useKresusState(state => driver.getTransactions(state));
    const balance = useKresusState(state => driver.getBalance(state));

    const makeByCategoryCharts = () => <CategoryCharts transactions={transactions} />;
    const makeBalanceCharts = () => <BalanceChart transactions={transactions} balance={balance} />;
    const makePosNegChart = () => <InOutChart />;

    const tabs = new Map<string, TabDescriptor>();
    tabs.set(URL.charts.url('all', driver), {
        name: $t('client.charts.by_category'),
        component: makeByCategoryCharts,
    });
    tabs.set(URL.charts.url('balance', driver), {
        name: $t('client.charts.balance'),
        component: makeBalanceCharts,
    });
    tabs.set(URL.charts.url('earnings', driver), {
        name: $t('client.charts.differences'),
        component: makePosNegChart,
    });

    return (
        <div className="charts">
            <Form.Toolbar align="right">
                <DefaultParameters />
            </Form.Toolbar>

            <TabsContainer
                tabs={tabs}
                defaultTab={URL.charts.url(defaultDisplay, driver)}
                selectedTab={location.pathname}
            />
        </div>
    );
};

export default Charts;
