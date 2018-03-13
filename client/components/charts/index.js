import React from 'react';
import { connect } from 'react-redux';
import { Route, Switch, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import { get } from '../../store';
import { translate as $t } from '../../helpers';

import InOutChart from './in-out-chart';
import BalanceChart from './balance-chart';
import OperationsByCategoryChart from './operations-by-category-chart';
import DefaultParamsModal from './default-params-modal';

import TabMenu from '../ui/tab-menu.js';

class ChartsComponent extends React.Component {
    makeAllChart = () => {
        return <OperationsByCategoryChart operations={this.props.operations} />;
    };

    makeBalanceChart = () => {
        return <BalanceChart operations={this.props.operations} account={this.props.account} />;
    };

    makePosNegChart = () => {
        return (
            <InOutChart
                operations={this.props.operationsCurrentAccounts}
                theme={this.props.theme}
            />
        );
    };

    render() {
        const { currentAccountId } = this.props.match.params;
        const pathPrefix = '/charts';

        let menuItems = new Map();
        menuItems.set(`${pathPrefix}/all/${currentAccountId}`, $t('client.charts.by_category'));
        menuItems.set(`${pathPrefix}/balance/${currentAccountId}`, $t('client.charts.balance'));
        menuItems.set(
            `${pathPrefix}/earnings/${currentAccountId}`,
            $t('client.charts.differences_all')
        );

        const { defaultDisplay } = this.props;

        return (
            <div className="charts">
                <p>
                    <button
                        className="btn btn-default default-params"
                        data-toggle="modal"
                        data-target="#defaultParams">
                        <span className="fa fa-cog" />
                        {$t('client.general.default_parameters')}
                    </button>
                </p>

                <DefaultParamsModal modalId="defaultParams" />

                <div>
                    <TabMenu
                        selected={this.props.location.pathname}
                        tabs={menuItems}
                        history={this.props.history}
                        location={this.props.location}
                    />
                    <div className="tab-content">
                        <Switch>
                            <Route
                                path={`${pathPrefix}/all/${currentAccountId}`}
                                component={this.makeAllChart}
                            />
                            <Route
                                path={`${pathPrefix}/balance/${currentAccountId}`}
                                component={this.makeBalanceChart}
                            />
                            <Route
                                path={`${pathPrefix}/earnings/${currentAccountId}`}
                                component={this.makePosNegChart}
                            />
                            <Redirect
                                to={`${pathPrefix}/${defaultDisplay}/${currentAccountId}`}
                                push={false}
                            />
                        </Switch>
                    </div>
                </div>
            </div>
        );
    }
}

ChartsComponent.propTypes = {
    // The kind of chart to display: by categories, balance, or in and outs for all accounts.
    defaultDisplay: PropTypes.string.isRequired,

    // The current account.
    account: PropTypes.object.isRequired,

    // The operations for the current account.
    operations: PropTypes.array.isRequired,

    // The operations for the current accounts.
    operationsCurrentAccounts: PropTypes.array.isRequired,

    // The history object, providing access to the history API.
    // Automatically added by the Route component.
    history: PropTypes.object.isRequired,

    // Location object (contains the current path). Automatically added by react-router.
    location: PropTypes.object.isRequired,

    // The current theme.
    theme: PropTypes.string.isRequired
};

const Export = connect((state, ownProps) => {
    let accountId = ownProps.match.params.currentAccountId;
    let account = get.accountById(state, accountId);
    let currentAccessId = account.bankAccess;
    // FIXME find a more efficient way to do this.
    let currentAccounts = get.accountsByAccessId(state, currentAccessId).map(acc => acc.id);
    let operationsCurrentAccounts = get.operationsByAccountIds(state, currentAccounts);

    let operations = get.operationsByAccountIds(state, accountId);

    let defaultDisplay = get.setting(state, 'defaultChartDisplayType');

    let theme = get.setting(state, 'theme');

    return {
        defaultDisplay,
        account,
        operations,
        operationsCurrentAccounts,
        theme
    };
})(ChartsComponent);

export default Export;
