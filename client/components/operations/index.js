import React from 'react';

import { connect } from 'react-redux';

import { translate as $t, formatDate } from '../../helpers';

import { get, actions } from '../../store';

import InfiniteList from '../ui/infinite-list';

import SearchComponent from './search';
import { OperationItem, PressableOperationItem } from './item';
import SyncButton from './sync-button';
import AddOperationModalButton from './add-operation-button';
import DisplayIf, { IfNotMobile } from '../ui/display-if';
import withCurrentAccountId from '../withCurrentAccountId';

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

    state = {
        heightAbove: 0
    };

    renderItems = (itemIds, low, high) => {
        let Item = this.props.isSmallScreen ? PressableOperationItem : OperationItem;

        let max = Math.min(itemIds.length, high);

        let renderedItems = [];
        for (let i = low; i < max; ++i) {
            renderedItems.push(
                <Item
                    key={itemIds[i]}
                    operationId={itemIds[i]}
                    formatCurrency={this.props.account.formatCurrency}
                    isMobile={this.props.isSmallScreen}
                />
            );
        }

        return renderedItems;
    };

    getHeightAbove = () => {
        return (
            this.refOperationTable.current.offsetTop +
            this.refTableCaption.current.scrollHeight +
            this.refThead.current.scrollHeight
        );
    };

    componentDidMount() {
        // Called after first render => safe to use references.
        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState({
            heightAbove: this.getHeightAbove()
        });
    }

    componentDidUpdate() {
        let heightAbove = this.getHeightAbove();
        if (heightAbove !== this.state.heightAbove) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({
                heightAbove
            });
        }
    }

    render() {
        let asOf = $t('client.operations.as_of');
        let lastCheckDate = formatDate.toShortString(this.props.account.lastCheckDate);
        lastCheckDate = `${asOf} ${lastCheckDate}`;

        let { balance, formatCurrency } = this.props.account;

        return (
            <div>
                <p className="account-summary">
                    <span className="icon">
                        <span className="fa fa-balance-scale" />
                    </span>
                    <span className="amount">{formatCurrency(balance)}</span>
                    <span>{$t('client.operations.current_balance')}</span>
                    <span className="separator">&nbsp;</span>
                    <span className="date">{lastCheckDate}</span>
                </p>

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

                <DisplayIf condition={this.props.hasSearchFields}>
                    <ul className="search-summary">
                        <li className="received">
                            <span className="fa fa-arrow-down" />
                            <span>{$t('client.operations.received')}</span>
                            <span>{this.props.positiveSum}</span>
                        </li>

                        <li className="spent">
                            <span className="fa fa-arrow-up" />
                            <span>{$t('client.operations.spent')}</span>
                            <span>{this.props.negativeSum}</span>
                        </li>

                        <li className="saved">
                            <span className="fa fa-database" />
                            <span>{$t('client.operations.saved')}</span>
                            <span>{this.props.wellSum}</span>
                        </li>
                    </ul>
                </DisplayIf>

                <table className="operation-table" ref={this.refOperationTable}>
                    <caption ref={this.refTableCaption}>{$t('client.operations.title')}</caption>
                    <thead ref={this.refThead}>
                        <tr>
                            <IfNotMobile>
                                <th className="modale-button" />
                            </IfNotMobile>
                            <th className="date">{$t('client.operations.column_date')}</th>
                            <IfNotMobile>
                                <th className="type">{$t('client.operations.column_type')}</th>
                            </IfNotMobile>
                            <th>{$t('client.operations.column_name')}</th>
                            <th className="amount">{$t('client.operations.column_amount')}</th>
                            <IfNotMobile>
                                <th className="category">
                                    {$t('client.operations.column_category')}
                                </th>
                            </IfNotMobile>
                        </tr>
                    </thead>
                    <InfiniteList
                        ballast={OPERATION_BALLAST}
                        items={this.props.filteredOperationIds}
                        itemHeight={this.props.operationHeight}
                        heightAbove={this.state.heightAbove}
                        renderItems={this.renderItems}
                        containerId={CONTAINER_ID}
                        key={this.props.account.id}
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
    filtered = filterIf(search.categoryIds.length > 0, filtered, op => {
        return search.categoryIds.includes(op.categoryId);
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
                !contains(op.rawLabel, str) &&
                !contains(op.label, str) &&
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
    let { currentAccountId } = ownProps;

    let account = get.accountById(state, currentAccountId);
    let operationIds = get.operationIdsByAccountId(state, currentAccountId);
    let hasSearchFields = get.hasSearchFields(state);
    let filteredOperationIds = get.hasSearchFields(state)
        ? filter(state, operationIds, get.searchFields(state))
        : operationIds;

    let wellOperationIds;
    if (hasSearchFields) {
        wellOperationIds = filteredOperationIds;
    } else {
        wellOperationIds = filterOperationsThisMonth(state, operationIds);
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
        wellSum,
        positiveSum,
        negativeSum,
        isSmallScreen,
        operationHeight,
        displaySearchDetails: get.displaySearchDetails(state)
    };
})(OperationsComponent);

export default withCurrentAccountId(Export);
