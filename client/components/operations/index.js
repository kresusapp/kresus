import React from 'react';

import { connect } from 'react-redux';

import { translate as $t, formatDate } from '../../helpers';

import { get, actions } from '../../store';
import URL from '../../urls';

import InfiniteList from '../ui/infinite-list';

import AmountWell from './amount-well';
import SearchComponent from './search';
import { OperationItem, PressableOperationItem } from './item';
import SyncButton from './sync-button';
import AddOperationModalButton from './add-operation-button';

// Infinite list properties.
const OPERATION_BALLAST = 10;
const CONTAINER_ID = 'content';

const SearchButton = connect(
    null,
    dispatch => {
        return {
            handleClick() {
                actions.toggleSearchDetails(dispatch);
            }
        };
    }
)(props => {
    return (
        <button
            type="button"
            className="btn transparent"
            aria-label={$t('client.search.title')}
            onClick={props.handleClick}
            title={$t('client.search.title')}>
            <span className="fa fa-search" />
            <span className="label">{$t('client.search.title')}</span>
        </button>
    );
});

// Keep in sync with style.css.
function getOperationHeight(isSmallScreen) {
    return isSmallScreen ? 41 : 55;
}

class OperationsComponent extends React.Component {
    refOperationTable = React.createRef();
    refTableCaption = React.createRef();
    refThead = React.createRef();
    heightAbove = 0;

    renderItems = (low, high) => {
        let Item = this.props.isSmallScreen ? PressableOperationItem : OperationItem;

        let ids = this.props.filteredOperationIds;
        let max = Math.min(ids.length, high);

        let items = [];
        for (let i = low; i < max; ++i) {
            items.push(
                <Item
                    key={ids[i]}
                    operationId={ids[i]}
                    formatCurrency={this.props.account.formatCurrency}
                    isMobile={this.props.isSmallScreen}
                />
            );
        }

        return items;
    };

    getHeightAbove = () => {
        return this.heightAbove;
    };

    componentDidMount() {
        let container = document.getElementById(CONTAINER_ID);
        if (container.scrollTop > 0) {
            container.scrollTop = 0;
        }

        // Called after first render => safe to use references.
        let heightAbove =
            this.refOperationTable.current.offsetTop +
            this.refTableCaption.current.scrollHeight +
            this.refThead.current.scrollHeight;
        this.heightAbove = heightAbove;
    }

    render() {
        let asOf = $t('client.operations.as_of');
        let lastCheckedDate = formatDate.toShortString(this.props.account.lastChecked);
        let lastCheckDate = `${asOf} ${lastCheckedDate}`;

        let { balance, formatCurrency } = this.props.account;

        let maybeDetailsButtonHeader = null;
        let maybeTypeHeader = null;
        let maybeCategoryHeader = null;

        if (!this.props.isSmallScreen) {
            maybeDetailsButtonHeader = <th className="modale-button" />;
            maybeTypeHeader = <th className="type">{$t('client.operations.column_type')}</th>;
            maybeCategoryHeader = (
                <th className="category">{$t('client.operations.column_category')}</th>
            );
        }

        return (
            <div>
                <div className="operation-wells">
                    <AmountWell
                        className="amount-well-balance"
                        icon="balance-scale"
                        title={$t('client.operations.current_balance')}
                        subtitle={lastCheckDate}
                        content={formatCurrency(balance)}
                    />

                    <AmountWell
                        className="amount-well-received"
                        icon="arrow-down"
                        title={$t('client.operations.received')}
                        subtitle={this.props.filteredSub}
                        content={this.props.positiveSum}
                    />

                    <AmountWell
                        className="amount-well-spent"
                        icon="arrow-up"
                        title={$t('client.operations.spent')}
                        subtitle={this.props.filteredSub}
                        content={this.props.negativeSum}
                    />

                    <AmountWell
                        className="amount-well-saved"
                        icon="database"
                        title={$t('client.operations.saved')}
                        subtitle={this.props.filteredSub}
                        content={this.props.wellSum}
                    />
                </div>

                <div className="operation-toolbar">
                    <ul>
                        <li>
                            <SearchButton />
                        </li>
                        <li>
                            <SyncButton account={this.props.account} />
                        </li>
                        <li>
                            <AddOperationModalButton accountId={this.props.account.id} />
                        </li>
                    </ul>
                    <SearchComponent />
                </div>

                <table className="operation-table" ref={this.refOperationTable}>
                    <caption ref={this.refTableCaption}>{$t('client.operations.title')}</caption>
                    <thead ref={this.refThead}>
                        <tr>
                            {maybeDetailsButtonHeader}
                            <th className="date">{$t('client.operations.column_date')}</th>
                            {maybeTypeHeader}
                            <th>{$t('client.operations.column_name')}</th>
                            <th className="amount">{$t('client.operations.column_amount')}</th>
                            {maybeCategoryHeader}
                        </tr>
                    </thead>
                    <InfiniteList
                        ballast={OPERATION_BALLAST}
                        numItems={this.props.filteredOperationIds.length}
                        itemHeight={this.props.operationHeight}
                        getHeightAbove={this.getHeightAbove}
                        renderItems={this.renderItems}
                        containerId={CONTAINER_ID}
                    />
                </table>
            </div>
        );
    }
}

function filter(state, operationsIds, search) {
    function contains(where, substring) {
        return where.toLowerCase().indexOf(substring) !== -1;
    }

    function filterIf(condition, array, callback) {
        if (condition) {
            return array.filter(callback);
        }
        return array;
    }

    // TODO : Use a better cache.
    let filtered = operationsIds.map(id => get.operationById(state, id));

    // Filter! Apply most discriminatory / easiest filters first
    filtered = filterIf(search.categoryId !== '', filtered, op => {
        return op.categoryId === search.categoryId;
    });

    filtered = filterIf(search.type !== '', filtered, op => {
        return op.type === search.type;
    });

    filtered = filterIf(search.amountLow !== null, filtered, op => {
        return op.amount >= search.amountLow;
    });

    filtered = filterIf(search.amountHigh !== null, filtered, op => {
        return op.amount <= search.amountHigh;
    });
    filtered = filterIf(search.dateLow !== null, filtered, op => {
        return op.date >= search.dateLow;
    });

    filtered = filterIf(search.dateHigh !== null, filtered, op => {
        return op.date <= search.dateHigh;
    });

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
    filtered = filtered.map(op => op.id);

    return filtered;
}

// Returns operation ids.
function filterOperationsThisMonth(state, operationsId) {
    let now = new Date();
    let currentYear = now.getFullYear();
    let currentMonth = now.getMonth();
    return operationsId.filter(id => {
        let op = get.operationById(state, id);
        return (
            op.budgetDate.getFullYear() === currentYear && op.budgetDate.getMonth() === currentMonth
        );
    });
}

function computeTotal(state, filterFunction, operationIds) {
    let total = operationIds
        .map(id => get.operationById(state, id))
        .filter(filterFunction)
        .reduce((a, b) => a + b.amount, 0);
    return Math.round(total * 100) / 100;
}

const Export = connect((state, ownProps) => {
    let accountId = URL.reports.accountId(ownProps.match);

    let account = get.accountById(state, accountId);
    let operationIds = get.operationIdsByAccountId(state, accountId);
    let hasSearchFields = get.hasSearchFields(state);
    let filteredOperationIds = get.hasSearchFields(state)
        ? filter(state, operationIds, get.searchFields(state))
        : operationIds;

    let wellOperationIds, filteredSub;
    if (hasSearchFields) {
        wellOperationIds = filteredOperationIds;
        filteredSub = $t('client.amount_well.current_search');
    } else {
        wellOperationIds = filterOperationsThisMonth(state, operationIds);
        filteredSub = $t('client.amount_well.this_month');
    }

    let positiveSum = computeTotal(state, x => x.amount > 0, wellOperationIds);
    let negativeSum = computeTotal(state, x => x.amount < 0, wellOperationIds);
    let wellSum = positiveSum + negativeSum;

    let format = account.formatCurrency;
    positiveSum = format(positiveSum);
    negativeSum = format(negativeSum);
    wellSum = format(wellSum);

    let isSmallScreen = get.isSmallScreen(state);
    let operationHeight = getOperationHeight(isSmallScreen);

    return {
        account,
        filteredOperationIds,
        hasSearchFields,
        filteredSub,
        wellSum,
        positiveSum,
        negativeSum,
        isSmallScreen,
        operationHeight
    };
})(OperationsComponent);

export default Export;
