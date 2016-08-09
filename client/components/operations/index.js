import React from 'react';
import ReactDOM from 'react-dom';

import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { translate as $t, OUT_OF_BALANCE_TYPES, OUT_OF_FUTURE_BALANCE_TYPES } from '../../helpers';

import { get } from '../../store';

import { AmountWell, FilteredAmountWell } from './amount-well';
import SearchComponent from './search';
import OperationItem from './item';
import SyncButton from './sync-button';

import throttle from 'lodash.throttle';

// Height of an operation line (px) based on the css settings
let OPERATION_HEIGHT = setOperationHeight();

// Number of operations before / after the ones to render, for flexibility.
const OPERATION_BALLAST = 10;

// Throttling for the scroll event (ms)
const SCROLL_THROTTLING = 150;

// Number of elements
let INITIAL_SHOW_ITEMS = window.innerHeight / OPERATION_HEIGHT | 0;

// Filter functions used in amount wells.
function noFilter(op) {
    return OUT_OF_BALANCE_TYPES.indexOf(op.type) === -1;
}
function isPositive(op) {
    return op.amount > 0;
}
function isNegative(op) {
    return op.amount < 0;
}

function isFuture(op) {
    return op.isFuture || OUT_OF_FUTURE_BALANCE_TYPES.indexOf(op.type) === -1;
}

function setOperationHeight() {
    // Keep in sync with style.css.
    return window.innerWidth < 768 ? 41 : 54;
}

function filterOperationsThisMonth(operations) {
    let now = new Date();
    return operations.filter(op => {
        let d = new Date(op.date);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
}

class OperationsComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            firstItemShown: 0,
            lastItemShown: INITIAL_SHOW_ITEMS
        };

        this.handleScroll = throttle(this.onScroll.bind(this), SCROLL_THROTTLING);
        this.handleResize = this.handleResize.bind(this);
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize(e) {
        e.preventDefault();
        OPERATION_HEIGHT = setOperationHeight();
        INITIAL_SHOW_ITEMS = window.innerHeight / OPERATION_HEIGHT | 0;
        this.handleScroll();
    }

    onScroll() {
        let wellH = ReactDOM.findDOMNode(this.refs.wells).scrollHeight;
        let searchH = ReactDOM.findDOMNode(this.refs.search).scrollHeight;
        let panelH = ReactDOM.findDOMNode(this.refs.panelHeading).scrollHeight;
        let theadH = ReactDOM.findDOMNode(this.refs.thead).scrollHeight;
        let fixedTopH = wellH + searchH + panelH + theadH;

        let topItemH = Math.max(window.scrollY - fixedTopH, 0);
        let bottomItemH = topItemH + window.innerHeight;

        let firstItemShown = Math.max(topItemH / OPERATION_HEIGHT - OPERATION_BALLAST | 0, 0);
        let lastItemShown = (bottomItemH / OPERATION_HEIGHT | 0) + OPERATION_BALLAST;

        this.setState({
            firstItemShown,
            lastItemShown
        });
    }

    render() {
        // Edge case: the component hasn't retrieved the account yet.
        if (this.props.account === null) {
            return <div/>;
        }

        let bufferPreH = OPERATION_HEIGHT * this.state.firstItemShown;
        let bufferPre = <tr style={ { height: `${bufferPreH}px` } } />;

        let formatCurrency = this.props.account.formatCurrency;
        let ops = this.props.filteredOperations
                    .slice(this.state.firstItemShown, this.state.lastItemShown)
                    .map(o =>
                        <OperationItem key={ o.id }
                          operation={ o }
                          formatCurrency={ formatCurrency }
                        />);

        let numOps = this.props.filteredOperations.length;
        let bufferPostH = OPERATION_HEIGHT * Math.max(numOps - this.state.lastItemShown, 0);
        let bufferPost = <tr style={ { height: `${bufferPostH}px` } } />;

        let asOf = $t('client.operations.as_of');
        let lastCheckedDate = new Date(this.props.account.lastChecked).toLocaleDateString();
        let lastCheckDate = `${asOf} ${lastCheckedDate}`;

        let wellOperations;
        // TODO cleanup: this component should set all fields of the
        // AmountWell, so we can make the AmountWell a dump component.
        if (this.props.hasSearchFields) {
            wellOperations = this.props.filteredOperations;
        } else {
            wellOperations = filterOperationsThisMonth(this.props.operations);
        }

        return (
            <div>
                <div className="row operation-wells" ref="wells">

                    <AmountWell
                      size="col-xs-12 col-md-3"
                      backgroundColor="background-lightblue"
                      icon="balance-scale"
                      title={ $t('client.operations.current_balance') }
                      subtitle={ lastCheckDate }
                      operations={ this.props.operations }
                      initialAmount={ this.props.account.initialAmount }
                      filterFunction={ noFilter }
                      formatCurrency={ formatCurrency }
                    />

                    <FilteredAmountWell
                      size="col-xs-12 col-md-3"
                      backgroundColor="background-green"
                      icon="arrow-down"
                      title={ $t('client.operations.received') }
                      operations={ wellOperations }
                      hasFilteredOperations={ this.props.hasSearchFields }
                      initialAmount={ 0 }
                      filterFunction={ isPositive }
                      formatCurrency={ formatCurrency }
                    />

                    <FilteredAmountWell
                      size="col-xs-12 col-md-3"
                      backgroundColor="background-green"
                      icon="arrow-down"
                      title={ $t('client.operations.received') }
                      operations={ wellOperations }
                      hasFilteredOperations={ this.props.hasSearchFields }
                      initialAmount={ 0 }
                      filterFunction={ isPositive }
                      formatCurrency={ formatCurrency }
                    />

                    <FilteredAmountWell
                      size="col-xs-12 col-md-3"
                      backgroundColor="background-orange"
                      icon="arrow-up"
                      title={ $t('client.operations.spent') }
                      operations={ wellOperations }
                      hasFilteredOperations={ this.props.hasSearchFields }
                      initialAmount={ 0 }
                      filterFunction={ isNegative }
                      formatCurrency={ formatCurrency }
                    />

                    <FilteredAmountWell
                      size="col-xs-12 col-md-3"
                      backgroundColor="background-darkblue"
                      icon="database"
                      title={ $t('client.operations.saved') }
                      operations={ wellOperations }
                      hasFilteredOperations={ this.props.hasSearchFields }
                      initialAmount={ 0 }
                      filterFunction={ noFilter }
                      formatCurrency={ formatCurrency }
                    />
                </div>

                <SearchComponent ref="search" />

                <div className="operation-panel panel panel-default">
                    <div className="panel-heading" ref="panelHeading">
                        <h3 className="title panel-title">
                            { $t('client.operations.title') }
                        </h3>
                        <SyncButton account={ this.props.account } />
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover table-bordered">
                            <thead ref="thead">
                                <tr>
                                    <th className="hidden-xs"></th>
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
                            <tbody>
                                { bufferPre }
                                { ops }
                                { bufferPost }
                            </tbody>
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

    filtered = filterIf(search.amountLow !== '', filtered, op =>
        op.amount >= search.amountLow
    );

    filtered = filterIf(search.amountHigh !== '', filtered, op =>
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

const selectOperations = createSelector(
    [
        state => state,
        state => get.currentAccount(state).id
    ],
    get.operationsByAccountIds
);

const selectFilteredOperations = createSelector(
    [
        selectOperations,
        state => get.searchFields(state)
    ],
    filter
);

const Export = connect(state => {
    let account = get.currentAccount(state);
    let hasSearchFields = get.hasSearchFields(state);
    let operations = selectOperations(state);
    let filteredOperations = selectFilteredOperations(state);
    return {
        account,
        operations,
        filteredOperations,
        hasSearchFields
    };
})(OperationsComponent);

export default Export;
