import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { get, actions } from '../../store';
import { translate as $t } from '../../helpers';

import InOutChart from './in-out-chart';
import BalanceChart from './balance-chart';
import OperationsByCategoryChart from './operations-by-category-chart';
import { MODAL_SLUG } from './default-params-modal';

import TabsContainer from '../ui/tabs.js';

const ShowParamsButton = connect(
    null,
    dispatch => {
        return {
            handleClick() {
                actions.showModal(dispatch, MODAL_SLUG);
            }
        };
    }
)(props => (
    <button className="btn btn-default pull-right" onClick={props.handleClick}>
        <span className="fa fa-cog" />
        <span>{$t('client.general.default_parameters')}</span>
    </button>
));

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
                operations={this.props.currentAccountsOperations}
                theme={this.props.theme}
            />
        );
    };

    render() {
        const { currentAccountId } = this.props.match.params;
        const pathPrefix = '/charts';

        let tabs = new Map();
        tabs.set(`${pathPrefix}/all/${currentAccountId}`, {
            name: $t('client.charts.by_category'),
            component: this.makeAllChart
        });
        tabs.set(`${pathPrefix}/balance/${currentAccountId}`, {
            name: $t('client.charts.balance'),
            component: this.makeBalanceChart
        });
        tabs.set(`${pathPrefix}/earnings/${currentAccountId}`, {
            name: $t('client.charts.differences_all'),
            component: this.makePosNegChart
        });

        const { defaultDisplay } = this.props;

        return (
            <div className="charts">
                <p>
                    <ShowParamsButton />
                </p>

                <TabsContainer
                    tabs={tabs}
                    defaultTab={`${pathPrefix}/${defaultDisplay}/${currentAccountId}`}
                    selectedTab={this.props.location.hostname}
                    history={this.props.history}
                    location={this.props.location}
                />
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
    currentAccountsOperations: PropTypes.array.isRequired,

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
    let currentAccountIds = get.accountIdsByAccessId(state, currentAccessId);

    let currentAccountsOperations = currentAccountIds.reduce((operations, id) => {
        return operations.concat(get.operationsByAccountId(state, id));
    }, []);

    let operations = get.operationsByAccountId(state, accountId);
    let defaultDisplay = get.setting(state, 'defaultChartDisplayType');

    let theme = get.setting(state, 'theme');

    return {
        defaultDisplay,
        account,
        operations,
        currentAccountsOperations,
        theme
    };
})(ChartsComponent);

export default Export;
