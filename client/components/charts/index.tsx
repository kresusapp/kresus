import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';

import URL from '../../urls';
import { get } from '../../store';
import { assert, translate as $t, useKresusState } from '../../helpers';

import InOutChart from './in-out-chart';
import BalanceChart from './balance-chart';
import CategoryCharts from './category-charts';

import TabsContainer, { TabDescriptor } from '../ui/tabs';
import { ViewContext, DriverType } from '../drivers';

import { DARK_MODE, DEFAULT_CHART_DISPLAY_TYPE } from '../../../shared/settings';
import DefaultParameters from './default-params';

import 'c3/c3.css';
import './charts.css';

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

    const location = useLocation();

    const makeAllCharts = () => <CategoryCharts transactions={view.transactions} />;
    const makeBalanceCharts = () => (
        <BalanceChart
            transactions={view.transactions}
            initialBalance={view.initialBalance}
            theme={theme}
        />
    );

    const tabs = new Map<string, TabDescriptor>();
    tabs.set(URL.charts.url('all', view.driver), {
        name: $t('client.charts.by_category'),
        component: makeAllCharts,
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
            <p className="buttons-toolbar">
                <DefaultParameters />
            </p>

            <TabsContainer
                tabs={tabs}
                defaultTab={URL.charts.url(defaultDisplay, view.driver)}
                selectedTab={location.pathname}
            />
        </div>
    );
};

export default Charts;
