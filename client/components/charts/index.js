import React from 'react';
import { connect } from 'react-redux';
import { Route, Switch, Redirect } from 'react-router-dom';

import { get } from '../../store';
import { translate as $t } from '../../helpers';

import InOutChart from './in-out-chart';
import BalanceChart from './balance-chart';
import OperationsByCategoryChart from './operations-by-category-chart';
import DefaultParamsModal from './default-params-modal';

import TabMenu from '../ui/tab-menu.js';

const ChartsComponent = props => {
    let menuItems = new Map();
    menuItems.set('/charts/all', $t('client.charts.by_category'));
    menuItems.set('/charts/balance', $t('client.charts.balance'));
    menuItems.set('/charts/earnings', $t('client.charts.differences_all'));

    const redirectComponent = () => <Redirect to={ `/charts/${props.defaultDisplay}` } />;

    const allChart = () => {
        return (
            <OperationsByCategoryChart
              operations={ props.operations }
            />
        );
    };

    const balanceChart = () => {
        return (
            <BalanceChart
              operations={ props.operations }
              account={ props.account }
            />
        );
    };

    const posNegChart = () => {
        return (
            <InOutChart operations={ props.operationsCurrentAccounts } />
        );
    };

    return (
        <div className="top-panel panel panel-default">
            <div className="panel-heading">
                <h3 className="title panel-title">
                    { $t('client.charts.title') }
                </h3>

                <div className="panel-options">
                    <span
                      className='option-legend fa fa-cog'
                      title={ $t('client.general.default_parameters') }
                      data-toggle="modal"
                      data-target='#defaultParams'
                    />
                </div>
                <DefaultParamsModal modalId='defaultParams' />
            </div>

            <div className="panel-body">
                <TabMenu
                  selected={ props.location.pathname }
                  tabs={ menuItems }
                  push={ props.push }
                />
                <div className="tab-content">
                    <Switch>
                        <Route
                          path="/charts"
                          render={ redirectComponent }
                          exact={ true }
                        />
                        <Route
                          path="/charts/all"
                          component={ allChart }
                        />
                        <Route
                          path="/charts/balance"
                          component={ balanceChart }
                        />
                        <Route
                          path="/charts/earnings"
                          component={ posNegChart }
                        />
                    </Switch>
                </div>
            </div>
        </div>
    );
};

ChartsComponent.propTypes = {
    // The kind of chart to display: by categories, balance, or in and outs for all accounts.
    defaultDisplay: React.PropTypes.string.isRequired,

    // The current account.
    account: React.PropTypes.object.isRequired,

    // The operations for the current account.
    operations: React.PropTypes.array.isRequired,

    // The operations for the current accounts.
    operationsCurrentAccounts: React.PropTypes.array.isRequired,

    // Function to add an entry to the history. Automatically added by react-router;
    push: React.PropTypes.func.isRequired,

    // Location object (contains the current path). Automatically added by react-router.
    location: React.PropTypes.object.isRequired
};

const Export = connect(state => {
    // FIXME find a more efficient way to do this.
    let currentAccounts = get.currentAccounts(state).map(account => account.id);
    let operationsCurrentAccounts = get.operationsByAccountIds(state, currentAccounts);

    let account = get.currentAccount(state);
    let operations = get.currentOperations(state);

    let defaultDisplay = get.setting(state, 'defaultChartDisplayType');

    return {
        defaultDisplay,
        account,
        operations,
        operationsCurrentAccounts
    };
})(ChartsComponent);

export default Export;
