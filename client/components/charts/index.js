import React from 'react';
import { connect } from 'react-redux';

import { get } from '../../store';
import { assert, translate as $t } from '../../helpers';

import InOutChart from './in-out-chart';
import BalanceChart from './balance-chart';
import OperationsByCategoryChart from './operations-by-category-chart';

// Components
class ChartsComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            kind: 'all'
        };
    }

    changeKind(kind) {
        this.setState({ kind });
    }

    onClick(kind) {
        return () => this.changeKind(kind);
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
            case 'pos-neg': {
                chartComponent = <InOutChart operations={ this.props.operationsCurrentAccounts } />;
                break;
            }
            default: assert(false, 'unexpected chart kind');
        }

        let isActive = function(which) {
            return which === this.state.kind ? 'active' : '';
        };
        isActive = isActive.bind(this);

        return (
            <div className="top-panel panel panel-default">
                <div className="panel-heading">
                    <h3 className="title panel-title">
                        { $t('client.charts.title') }
                    </h3>
                </div>

                <div className="panel-body">
                    <ul className="nav nav-pills" role="tablist">
                        <li role="presentation" className={ isActive('all') }>
                            <a href="#" onClick={ this.onClick('all') }>
                                { $t('client.charts.by_category') }
                            </a>
                        </li>
                        <li role="presentation" className={ isActive('balance') }>
                            <a href="#" onClick={ this.onClick('balance') }>
                                { $t('client.charts.balance') }
                            </a>
                        </li>
                        <li role="presentation" className={ isActive('pos-neg') }>
                            <a href="#" onClick={ this.onClick('pos-neg') }>
                                { $t('client.charts.differences_all') }
                            </a>
                        </li>
                    </ul>
                    <div className="tab-content">
                        { chartComponent }
                    </div>
                </div>
            </div>
        );
    }
}

const Export = connect(state => {
    // FIXME find a more efficient way to do this.
    let currentAccounts = get.currentAccounts(state).map(account => account.id);
    let operationsCurrentAccounts = get.operationsByAccountIds(state, currentAccounts);

    let account = get.currentAccount(state);
    let operations = get.currentOperations(state);

    return {
        account,
        operations,
        operationsCurrentAccounts
    };
})(ChartsComponent);

export default Export;
