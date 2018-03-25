import React from 'react';
import ReactDOM from 'react-dom';

import { connect } from 'react-redux';

import { translate as $t, formatDate } from '../../helpers';

import { get } from '../../store';

import InfiniteList from '../ui/infinite-list';
import withLongPress from '../ui/longpress';

import AmountWell from './amount-well';
import DetailsModal from './details';
import SearchComponent from './search';
import OperationItem from './item';
import SyncButton from './sync-button';

// Infinite list properties.
const OPERATION_BALLAST = 10;

const PressableOperationItem = withLongPress(OperationItem);

// Keep in sync with style.css.
function computeOperationHeight(isSmallScreen) {
    return isSmallScreen ? 41 : 55;
}

function filterOperationsThisMonth(operations) {
    let now = new Date();
    return operations.filter(op => {
        let d = new Date(op.budgetDate);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
}

function computeTotal(format, filterFunction, operations, initial = 0) {
    let total = operations.filter(filterFunction).reduce((a, b) => a + b.amount, initial);
    return format(Math.round(total * 100) / 100);
}

class OperationsComponent extends React.Component {
    detailsModal = null;
    operationPanel = null;
    panelHeading = null;
    thead = null;

    constructor(props) {
        super(props);
        this.operationHeight = computeOperationHeight(this.props.isSmallScreen);
    }

    selectModalOperation = operationId => {
        this.detailsModal.setOperationId(operationId);
    };

    // Implementation of infinite list.
    renderItems = (low, high) => {
        return this.props.filteredOperations.slice(low, high).map(o => {
            let handleOpenModal = () => this.selectModalOperation(o.id);
            return (
                <PressableOperationItem
                    key={o.id}
                    operation={o}
                    formatCurrency={this.props.account.formatCurrency}
                    onOpenModal={handleOpenModal}
                    onLongPress={handleOpenModal}
                />
            );
        });
    };

    computeHeightAbove = () => {
        return this.heightAbove;
    };

    getOperationHeight = () => {
        return this.operationHeight;
    };

    getNumItems = () => {
        return this.props.filteredOperations.length;
    };
    // End of implementation of infinite list.

    refDetailsModal = node => {
        this.detailsModal = node;
    };

    refOperationPanel = node => {
        this.operationPanel = node;
    };

    refPanelHeading = node => {
        this.panelHeading = node;
    };

    refThead = node => {
        this.thead = node;
    };

    componentDidMount() {
        // Called after first render => safe to use findDOMNode.
        let heightAbove = ReactDOM.findDOMNode(this.operationPanel).offsetTop;
        heightAbove += ReactDOM.findDOMNode(this.panelHeading).scrollHeight;
        heightAbove += ReactDOM.findDOMNode(this.thead).scrollHeight;
        this.heightAbove = heightAbove;
        this.operationHeight = computeOperationHeight(this.props.isSmallScreen);
    }

    render() {
        let asOf = $t('client.operations.as_of');
        let lastCheckedDate = formatDate.toShortString(this.props.account.lastChecked);
        let lastCheckDate = `${asOf} ${lastCheckedDate}`;

        let wellOperations, filteredSub;
        if (this.props.hasSearchFields) {
            wellOperations = this.props.filteredOperations;
            filteredSub = $t('client.amount_well.current_search');
        } else {
            wellOperations = filterOperationsThisMonth(this.props.operations);
            filteredSub = $t('client.amount_well.this_month');
        }

        let format = this.props.account.formatCurrency;

        let balance = computeTotal(
            format,
            () => true,
            this.props.operations,
            this.props.account.initialAmount
        );

        let positiveSum = computeTotal(format, x => x.amount > 0, wellOperations, 0);
        let negativeSum = computeTotal(format, x => x.amount < 0, wellOperations, 0);
        let sum = computeTotal(format, () => true, wellOperations, 0);

        return (
            <div>
                <DetailsModal ref={this.refDetailsModal} formatCurrency={format} />

                <div className="operation-wells">
                    <AmountWell
                        className="amount-well-balance"
                        icon="balance-scale"
                        title={$t('client.operations.current_balance')}
                        subtitle={lastCheckDate}
                        content={balance}
                    />

                    <AmountWell
                        className="amount-well-received"
                        icon="arrow-down"
                        title={$t('client.operations.received')}
                        subtitle={filteredSub}
                        content={positiveSum}
                    />

                    <AmountWell
                        className="amount-well-spent"
                        icon="arrow-up"
                        title={$t('client.operations.spent')}
                        subtitle={filteredSub}
                        content={negativeSum}
                    />

                    <AmountWell
                        className="amount-well-saved"
                        icon="database"
                        title={$t('client.operations.saved')}
                        subtitle={filteredSub}
                        content={sum}
                    />
                </div>

                <SearchComponent />

                <div className="operation-panel panel panel-default" ref={this.refOperationPanel}>
                    <div className="panel-heading" ref={this.refPanelHeading}>
                        <h3 className="title panel-title">{$t('client.operations.title')}</h3>
                        <SyncButton account={this.props.account} />
                    </div>

                    <table className="operation-table table table-hover table-bordered">
                        <thead ref={this.refThead}>
                            <tr>
                                <th className="modale-button" />
                                <th className="date">{$t('client.operations.column_date')}</th>
                                <th className="type">{$t('client.operations.column_type')}</th>
                                <th>{$t('client.operations.column_name')}</th>
                                <th className="amount">{$t('client.operations.column_amount')}</th>
                                <th className="category">
                                    {$t('client.operations.column_category')}
                                </th>
                            </tr>
                        </thead>
                        <InfiniteList
                            ballast={OPERATION_BALLAST}
                            getNumItems={this.getNumItems}
                            getItemHeight={this.getOperationHeight}
                            getHeightAbove={this.computeHeightAbove}
                            renderItems={this.renderItems}
                            containerId="content"
                        />
                    </table>
                </div>
            </div>
        );
    }
}

function filter(operations, search) {
    function contains(where, substring) {
        return where.toLowerCase().indexOf(substring) !== -1;
    }

    function filterIf(condition, array, callback) {
        if (condition) {
            return array.filter(callback);
        }
        return array;
    }

    // Filter! Apply most discriminatory / easiest filters first
    let filtered = operations.slice();

    filtered = filterIf(
        search.categoryId !== '',
        filtered,
        op => op.categoryId === search.categoryId
    );

    filtered = filterIf(search.type !== '', filtered, op => op.type === search.type);

    filtered = filterIf(search.amountLow !== null, filtered, op => op.amount >= search.amountLow);

    filtered = filterIf(search.amountHigh !== null, filtered, op => op.amount <= search.amountHigh);

    filtered = filterIf(search.dateLow !== null, filtered, op => op.date >= search.dateLow);

    filtered = filterIf(search.dateHigh !== null, filtered, op => op.date <= search.dateHigh);

    filtered = filterIf(search.keywords.length > 0, filtered, op => {
        for (let str of search.keywords) {
            if (
                !contains(op.raw, str) &&
                !contains(op.title, str) &&
                (op.customLabel === null || !contains(op.customLabel, str))
            ) {
                return false;
            }
        }
        return true;
    });

    return filtered;
}

const Export = connect((state, ownProps) => {
    let accountId = ownProps.match.params.currentAccountId;
    let account = get.accountById(state, accountId);
    let operations = get.operationsByAccountIds(state, accountId);
    let hasSearchFields = get.hasSearchFields(state);
    let filteredOperations = filter(operations, get.searchFields(state));

    return {
        account,
        operations,
        filteredOperations,
        hasSearchFields
    };
})(OperationsComponent);

export default Export;
