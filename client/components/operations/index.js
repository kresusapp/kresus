import React from 'react';
import ReactDOM from 'react-dom';

import { connect } from 'react-redux';

import { translate as $t } from '../../helpers';

import { get } from '../../store';

import InfiniteList from '../ui/infinite-list';

import AmountWell from './amount-well';
import DetailsModal from './details';
import SearchComponent from './search';
import OperationItem from './item';
import SyncButton from './sync-button';

// Infinite list properties.
const OPERATION_BALLAST = 10;

// Keep in sync with style.css.
function computeOperationHeight() {
    return window.innerWidth < 768 ? 41 : 54;
}

function filterOperationsThisMonth(operations) {
    let now = new Date();
    return operations.filter(op => {
        let d = new Date(op.date);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
}

function computeTotal(format, filterFunction, operations, initial = 0) {
    let total = operations
                .filter(filterFunction)
                .reduce((a, b) => a + b.amount, initial);
    return format(Math.round(total * 100) / 100);
}

class OperationsComponent extends React.Component {

    constructor(props) {
        super(props);

        this.renderItems = this.renderItems.bind(this);
        this.computeHeightAbove = this.computeHeightAbove.bind(this);
        this.getOperationHeight = this.getOperationHeight.bind(this);
        this.getNumItems = this.getNumItems.bind(this);
        this.handleWindowResize = this.handleWindowResize.bind(this);

        this.operationHeight = computeOperationHeight();

        this.selectModalOperation = this.selectModalOperation.bind(this);
    }

    selectModalOperation(operationId) {
        this.refs.detailsModal.setOperationId(operationId);
    }

    // Implementation of infinite list.
    renderItems(low, high) {
        return this.props.filteredOperations
                         .slice(low, high)
                         .map(o => {
                             let handleOpenModal = () => this.selectModalOperation(o.id);
                             return (
                                 <OperationItem
                                   key={ o.id }
                                   operation={ o }
                                   formatCurrency={ this.props.account.formatCurrency }
                                   categories={ this.props.categories }
                                   getCategory={ this.props.getCategory }
                                   types={ this.props.types }
                                   onOpenModal={ handleOpenModal }
                                 />
                             );
                         });
    }

    componentDidMount() {
        // Called after first render => safe to use findDOMNode.
        this.handleWindowResize();
    }

    handleWindowResize() {
        let wellH = ReactDOM.findDOMNode(this.refs.wells).scrollHeight;
        let searchH = ReactDOM.findDOMNode(this.refs.search).scrollHeight;
        let panelH = ReactDOM.findDOMNode(this.refs.panelHeading).scrollHeight;
        let theadH = ReactDOM.findDOMNode(this.refs.thead).scrollHeight;

        this.heightAbove = wellH + searchH + panelH + theadH;

        this.operationHeight = computeOperationHeight();
    }

    computeHeightAbove() {
        return this.heightAbove;
    }

    getOperationHeight() {
        return this.operationHeight;
    }

    getNumItems() {
        return this.props.filteredOperations.length;
    }
    // End of implementation of infinite list.

    render() {
        let asOf = $t('client.operations.as_of');
        let lastCheckedDate = new Date(this.props.account.lastChecked).toLocaleDateString();
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

        let balance = computeTotal(format,
                                   () => true,
                                   this.props.operations,
                                   this.props.account.initialAmount);

        let positiveSum = computeTotal(format, x => x.amount > 0, wellOperations, 0);
        let negativeSum = computeTotal(format, x => x.amount < 0, wellOperations, 0);
        let sum = computeTotal(format, () => true, wellOperations, 0);

        return (
            <div>
                <DetailsModal
                  ref="detailsModal"
                  formatCurrency={ format }
                  categories={ this.props.categories }
                  types={ this.props.types }
                  getCategory={ this.props.getCategory }
                />

                <div
                  className="row operation-wells"
                  ref="wells">

                    <AmountWell
                      backgroundColor="background-lightblue"
                      size="col-xs-6 col-md-3"
                      icon="balance-scale"
                      title={ $t('client.operations.current_balance') }
                      subtitle={ lastCheckDate }
                      content={ balance }
                    />

                    <AmountWell
                      backgroundColor="background-green"
                      size="col-xs-6 col-md-3"
                      icon="arrow-down"
                      title={ $t('client.operations.received') }
                      subtitle={ filteredSub }
                      content={ positiveSum }
                    />

                    <AmountWell
                      backgroundColor="background-orange"
                      size="col-xs-6 col-md-3"
                      icon="arrow-up"
                      title={ $t('client.operations.spent') }
                      subtitle={ filteredSub }
                      content={ negativeSum }
                    />

                    <AmountWell
                      size="col-xs-6 col-md-3"
                      backgroundColor="background-darkblue"
                      icon="database"
                      title={ $t('client.operations.saved') }
                      subtitle={ filteredSub }
                      content={ sum }
                    />
                </div>

                <SearchComponent ref="search" />

                <div className="operation-panel panel panel-default">
                    <div
                      className="panel-heading"
                      ref="panelHeading">
                        <h3 className="title panel-title">
                            { $t('client.operations.title') }
                        </h3>
                        <SyncButton account={ this.props.account } />
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover table-bordered">
                            <thead ref="thead">
                                <tr>
                                    <th className="hidden-xs" />
                                    <th className="col-sm-1 col-xs-2">
                                        { $t('client.operations.column_date') }
                                    </th>
                                    <th className="col-sm-2 hidden-xs">
                                        { $t('client.operations.column_type') }
                                    </th>
                                    <th className="col-sm-6 col-xs-8">
                                        { $t('client.operations.column_name') }
                                    </th>
                                    <th className="col-sm-1 col-xs-2">
                                        { $t('client.operations.column_amount') }
                                    </th>
                                    <th className="col-sm-2 hidden-xs">
                                        { $t('client.operations.column_category') }
                                    </th>
                                </tr>
                            </thead>
                            <InfiniteList
                              ballast={ OPERATION_BALLAST }
                              getNumItems={ this.getNumItems }
                              getItemHeight={ this.getOperationHeight }
                              getHeightAbove={ this.computeHeightAbove }
                              renderItems={ this.renderItems }
                              onResizeUser={ this.handleWindowResize }
                            />
                        </table>
                    </div>

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
        if (condition)
            return array.filter(callback);
        return array;
    }

    // Filter! Apply most discriminatory / easiest filters first
    let filtered = operations.slice();

    filtered = filterIf(search.categoryId !== '', filtered, op =>
        op.categoryId === search.categoryId
    );

    filtered = filterIf(search.type !== '', filtered, op =>
        op.type === search.type
    );

    filtered = filterIf(search.amountLow !== null, filtered, op =>
        op.amount >= search.amountLow
    );

    filtered = filterIf(search.amountHigh !== null, filtered, op =>
        op.amount <= search.amountHigh
    );

    filtered = filterIf(search.dateLow !== null, filtered, op =>
        op.date >= search.dateLow
    );

    filtered = filterIf(search.dateHigh !== null, filtered, op =>
        op.date <= search.dateHigh
    );

    filtered = filterIf(search.keywords.length > 0, filtered, op => {
        for (let str of search.keywords) {
            if (!contains(op.raw, str) &&
                !contains(op.title, str) &&
                (op.customLabel === null || !contains(op.customLabel, str))) {
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
    let hasSearchFields = get.hasSearchFields(state);
    let operations = get.operationsByAccountIds(state, accountId);
    let filteredOperations = filter(operations, get.searchFields(state));

    let categories = get.categories(state);
    let types = get.types(state);
    let getCategory = categoryId => get.categoryById(state, categoryId);

    return {
        account,
        operations,
        filteredOperations,
        hasSearchFields,
        categories,
        types,
        getCategory
    };
})(OperationsComponent);

export default Export;
