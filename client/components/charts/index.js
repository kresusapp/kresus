import React from 'react';
import { connect } from 'react-redux';

import { get } from '../../store';
import { assert, translate as $t } from '../../helpers';

import InOutChart from './in-out-chart';
import BalanceChart from './balance-chart';
import OperationsByCategoryChart from './operations-by-category-chart';
import DefaultParamsModal from './default-params-modal';

import TabMenu from '../ui/tab-menu.js';

// Components
class ChartsComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            kind: props.displayType
        };

        this.handleTabChange = this.changeKind.bind(this);
    }

    changeKind(kind) {
        this.setState({ kind });
    }

    render() {
        let chartComponent = '';
        switch (this.state.kind) {
            case 'all': {
                chartComponent = (
                    <OperationsByCategoryChart
                      operations={ this.props.operations }
                    />
                );
                break;
            }
            case 'balance': {
                chartComponent = (
                    <BalanceChart
                      operations={ this.props.operations }
                      account={ this.props.account }
                    />
                );
                break;
            }
            case 'earnings': {
                chartComponent = <InOutChart operations={ this.props.operationsCurrentAccounts } />;
                break;
            }
            default: assert(false, 'unexpected chart kind');
        }

        let menuItems = new Map();
        menuItems.set('all', $t('client.charts.by_category'));
        menuItems.set('balance', $t('client.charts.balance'));
        menuItems.set('earnings', $t('client.charts.differences_all'));

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
                      onChange={ this.handleTabChange }
                      defaultValue={ this.state.kind }
                      tabs={ menuItems }
                    />
                    <div className="tab-content">
                        { chartComponent }
                    </div>
                </div>
            </div>
        );
    }
}

ChartsComponent.propTypes = {
    // The kind of chart to display: by categories, balance, or in and outs for all accounts
    displayType: React.PropTypes.string.isRequired,

    // The current account
    account: React.PropTypes.object.isRequired,

    // The operations for the current account
    operations: React.PropTypes.array.isRequired,

    // The operations for the current accounts
    operationsCurrentAccounts: React.PropTypes.array.isRequired
};

const Export = connect(state => {
    // FIXME find a more efficient way to do this.
    let currentAccounts = get.currentAccounts(state).map(account => account.id);
    let operationsCurrentAccounts = get.operationsByAccountIds(state, currentAccounts);

    let account = get.currentAccount(state);
    let operations = get.currentOperations(state);

    return {
        displayType: get.setting(state, 'defaultChartDisplayType'),
        account,
        operations,
        operationsCurrentAccounts
    };
})(ChartsComponent);

export default Export;
