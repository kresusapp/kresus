import React from 'react';

import { connect } from 'react-redux';

import { translate as $t, localeComparator, formatDate } from '../../helpers';

import { get, actions } from '../../store';

import InfiniteList from '../ui/infinite-list';

import SearchComponent from './search';
import BulkEditComponent from './bulkedit';
import { OperationItem, PressableOperationItem } from './item';
import MonthYearSeparator from './month-year-separator';
import SyncButton from './sync-button';
import AddOperationModalButton from './add-operation-button';
import DisplayIf, { IfNotMobile } from '../ui/display-if';
import withCurrentAccountId from '../withCurrentAccountId';

import './reports.css';
import './account-summary.css';
import './toolbar.css';

// Keep in sync with reports.css.
function getOperationHeight(isSmallScreen) {
    return isSmallScreen ? 41 : 55;
}

// Infinite list properties.
const OPERATION_BALLAST = 10;
const CONTAINER_ID = 'content-container';

const ITEM_KIND_TRANSACTION = 0;
const ITEM_KIND_DATE_SEPARATOR = 1;

const SearchButton = connect(null, dispatch => {
    return {
        handleClick() {
            actions.toggleSearchDetails(dispatch);
        },
    };
})(props => {
    return (
        <button
            type="button"
            className="btn"
            aria-label={$t('client.search.title')}
            onClick={props.handleClick}
            title={$t('client.search.title')}>
            <span className="fa fa-search" />
            <span className="label">{$t('client.search.title')}</span>
        </button>
    );
});

const BulkEditButton = props => {
    let toggleButtonClass = 'btn';
    if (props.isActive) {
        toggleButtonClass += ' active';
    }
    return (
        <button
            type="button"
            className={toggleButtonClass}
            aria-label={$t('client.bulkedit.title')}
            onClick={props.handleClick}
            title={$t('client.bulkedit.title')}>
            <span className="label">{$t('client.bulkedit.title')}</span>
            <span className="fa fa-list-alt" />
        </button>
    );
};

class OperationsComponent extends React.Component {
    refOperationTable = React.createRef();
    refThead = React.createRef();

    state = {
        heightAbove: 0,
        inBulkEditMode: false,
        bulkEditStatus: new Set(),
        bulkEditSelectAll: false,
        renderInfiniteList: {},
    };

    toggleBulkEditMode = () => {
        this.setState({
            inBulkEditMode: !this.state.inBulkEditMode,
            bulkEditStatus: new Set(),
            bulkEditSelectAll: false,
            renderInfiniteList: {},
        });
    };

    toggleAllBulkItems = isChecked => {
        let newStatus;
        if (!isChecked) {
            newStatus = new Set();
        } else {
            const transactionsIds = this.props.filteredTransactionsItems
                .filter(item => item.kind === ITEM_KIND_TRANSACTION)
                .map(item => item.transactionId);

            newStatus = new Set(transactionsIds);
        }
        this.setState({
            bulkEditStatus: newStatus,
            bulkEditSelectAll: isChecked,
            renderInfiniteList: {},
        });
    };

    toggleBulkItem = itemId => {
        let curStatus = this.state.bulkEditStatus;
        if (curStatus.has(itemId)) {
            curStatus.delete(itemId);
        } else {
            curStatus.add(itemId);
        }
        this.setState({
            bulkEditStatus: curStatus,
            renderInfiniteList: {},
            bulkEditSelectAll: false,
        });
    };

    renderItems = (items, low, high) => {
        let Item = this.props.isSmallScreen ? PressableOperationItem : OperationItem;

        let max = Math.min(items.length, high);

        let renderedItems = [];
        for (let i = low; i < max; ++i) {
            const item = items[i];

            // Check whether this is a transaction id or a month/year separator.
            if (item.kind === ITEM_KIND_DATE_SEPARATOR) {
                renderedItems.push(
                    <MonthYearSeparator
                        key={`${item.month}${item.year}`}
                        month={item.month}
                        year={item.year}
                        colspan={this.props.isSmallScreen ? 3 : 6}
                    />
                );
            } else {
                renderedItems.push(
                    <Item
                        key={item.transactionId}
                        operationId={item.transactionId}
                        formatCurrency={this.props.account.formatCurrency}
                        isMobile={this.props.isSmallScreen}
                        inBulkEditMode={this.state.inBulkEditMode}
                        bulkEditStatus={this.state.bulkEditStatus.has(item.transactionId)}
                        toggleBulkItem={this.toggleBulkItem}
                    />
                );
            }
        }

        return renderedItems;
    };

    getHeightAbove = () => {
        if (!this.refOperationTable || !this.refOperationTable.current) {
            return 0;
        }

        return this.refOperationTable.current.offsetTop + this.refThead.current.scrollHeight;
    };

    componentDidMount() {
        // Called after first render => safe to use references.
        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState({
            heightAbove: this.getHeightAbove(),
        });
    }

    componentDidUpdate() {
        let heightAbove = this.getHeightAbove();
        if (heightAbove !== this.state.heightAbove) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({
                heightAbove,
            });
        }
    }

    static getDerivedStateFromProps(props, state) {
        let { filteredTransactionsItems: items } = props;
        let { bulkEditStatus: prevStatus } = state;

        const transactionsIds = items
            .filter(item => item.kind === ITEM_KIND_TRANSACTION)
            .map(item => item.transactionId);

        // Remove from bulkEditStatus all the transactions which aren't in the
        // filteredTransactionsItems array anymore (because we changed account, or
        // searched something, etc.).
        let hasChanged = false;

        let newItemSet = new Set(transactionsIds);
        for (let id of prevStatus.values()) {
            if (!newItemSet.has(id)) {
                hasChanged = true;
                prevStatus.delete(id);
            }
        }

        if (state.bulkEditSelectAll) {
            for (let id of transactionsIds) {
                if (!prevStatus.has(id)) {
                    prevStatus.add(id);
                    hasChanged = true;
                }
            }
        }

        return hasChanged ? { bulkEditStatus: prevStatus, renderInfiniteList: {} } : null;
    }

    render() {
        let asOf = $t('client.operations.as_of');
        let lastCheckDate = formatDate.toShortString(this.props.account.lastCheckDate);
        lastCheckDate = `${asOf} ${lastCheckDate}`;

        let { balance, outstandingSum, formatCurrency } = this.props.account;

        return (
            <>
                <div className="account-summary">
                    <span className="icon">
                        <span className="fa fa-balance-scale" />
                    </span>

                    <div>
                        <p className="main-balance">
                            <span className="label">
                                <span>{$t('client.operations.current_balance')}</span>
                                <span className="separator">&nbsp;</span>
                                <span className="date">{lastCheckDate}</span>
                            </span>
                            <span className="amount">{formatCurrency(balance)}</span>
                        </p>

                        <DisplayIf condition={outstandingSum !== 0}>
                            <p>
                                <span className="label">{$t('client.menu.outstanding_sum')}</span>
                                <span className="amount">{formatCurrency(outstandingSum)}</span>
                            </p>

                            <p>
                                <span className="label">
                                    {$t('client.menu.outstanding_balance')}
                                </span>
                                <span className="amount">
                                    {formatCurrency(balance + outstandingSum)}
                                </span>
                            </p>
                        </DisplayIf>
                    </div>
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
                        <IfNotMobile>
                            <li>
                                <BulkEditButton
                                    isActive={this.state.inBulkEditMode}
                                    handleClick={this.toggleBulkEditMode}
                                />
                            </li>
                        </IfNotMobile>
                    </ul>
                    <SearchComponent
                        minAmount={this.props.minAmount}
                        maxAmount={this.props.maxAmount}
                    />
                </div>

                <DisplayIf condition={this.props.filteredTransactionsItems.length === 0}>
                    <p className="alerts info">
                        {$t('client.operations.no_transaction_found')}
                        <DisplayIf condition={this.props.hasSearchFields}>
                            {` ${$t('client.operations.broaden_search')}`}
                        </DisplayIf>
                    </p>
                </DisplayIf>

                <DisplayIf condition={this.props.filteredTransactionsItems.length > 0}>
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
                        <thead ref={this.refThead}>
                            <tr>
                                <IfNotMobile>
                                    <th className="modale-button" />
                                </IfNotMobile>
                                <th className="date">{$t('client.operations.column_date')}</th>
                                <IfNotMobile>
                                    <th className="type">{$t('client.operations.column_type')}</th>
                                </IfNotMobile>
                                <th className="label">{$t('client.operations.column_name')}</th>
                                <th className="amount">{$t('client.operations.column_amount')}</th>
                                <IfNotMobile>
                                    <th className="category">
                                        {$t('client.operations.column_category')}
                                    </th>
                                </IfNotMobile>
                            </tr>

                            <BulkEditComponent
                                inBulkEditMode={this.state.inBulkEditMode}
                                items={this.state.bulkEditStatus}
                                setAllStatus={this.state.bulkEditSelectAll}
                                setAllBulkEdit={this.toggleAllBulkItems}
                            />
                        </thead>

                        <InfiniteList
                            ballast={OPERATION_BALLAST}
                            items={this.props.filteredTransactionsItems}
                            renderInfiniteList={this.state.renderInfiniteList}
                            itemHeight={this.props.operationHeight}
                            heightAbove={this.state.heightAbove}
                            renderItems={this.renderItems}
                            containerId={CONTAINER_ID}
                            key={this.props.account.id}
                        />
                    </table>
                </DisplayIf>
            </>
        );
    }
}

function localeContains(where, substring) {
    let haystack = where.toLowerCase().normalize('NFKC');
    let needle = substring.toLowerCase().normalize('NFKC');
    if (haystack.includes(needle)) {
        return true;
    }
    let needleLength = needle.length;
    const max = Math.max(haystack.length - needleLength + 1, 0);
    for (let i = 0; i < max; ++i) {
        let match = true;
        for (let j = 0; j < needleLength; ++j) {
            let cur = haystack[i + j];
            if (cur === ' ') {
                // Skip to the next word in the haystack.
                i += j;
                match = false;
                break;
            } else if (localeComparator(needle[j], cur) !== 0) {
                match = false;
                break;
            }
        }
        if (match) {
            return true;
        }
    }
    return false;
}

function filter(state, operationsIds, search) {
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
                (op.customLabel === null || !localeContains(op.customLabel, str)) &&
                !localeContains(op.label, str) &&
                !localeContains(op.rawLabel, str)
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

function computeMinMax(state, operationIds) {
    let min = Infinity;
    let max = -Infinity;
    for (let id of operationIds) {
        let op = get.operationById(state, id);
        if (op.amount < min) {
            min = op.amount;
        }
        if (op.amount > max) {
            max = op.amount;
        }
    }
    // Round the values to the nearest integer.
    min = Math.floor(min);
    max = Math.ceil(max);
    return [min, max];
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

    // Insert month/year rows. We expect transactions ids to already be sorted chronologically.
    const transactionsAndSeparators = [];
    let month = null;
    let year = null;
    for (let opId of filteredOperationIds) {
        const transaction = get.operationById(state, opId);
        const transactionMonth = transaction.date.getMonth();
        const transactionYear = transaction.date.getFullYear();

        if (
            month === null ||
            year === null ||
            transactionYear !== year ||
            transactionMonth !== month
        ) {
            transactionsAndSeparators.push({
                kind: ITEM_KIND_DATE_SEPARATOR,
                month: transactionMonth,
                year: transactionYear,
            });
            month = transactionMonth;
            year = transactionYear;
        }

        transactionsAndSeparators.push({
            kind: ITEM_KIND_TRANSACTION,
            transactionId: opId,
        });
    }

    let extremes = computeMinMax(state, operationIds);

    let isSmallScreen = get.isSmallScreen(state);
    let operationHeight = getOperationHeight(isSmallScreen);

    return {
        account,
        filteredTransactionsItems: transactionsAndSeparators,
        hasSearchFields,
        wellSum,
        positiveSum,
        negativeSum,
        isSmallScreen,
        operationHeight,
        displaySearchDetails: get.displaySearchDetails(state),
        minAmount: extremes[0],
        maxAmount: extremes[1],
    };
})(OperationsComponent);

export default withCurrentAccountId(Export);

export const testing = {
    localeContains,
};
