import React from 'react';

import { connect } from 'react-redux';

import { translate as $t, UNKNOWN_OPERATION_TYPE, NONE_CATEGORY_ID } from '../../helpers';
import { get, actions } from '../../store';

import DatePicker from '../ui/date-picker';
import AmountInput from '../ui/amount-input';

class SearchComponent extends React.Component {
    constructor(props) {
        super(props);
        this.handleToggleDetails = this.handleToggleDetails.bind(this);
        this.handleClearSearchNoClose = this.handleClearSearch.bind(this, false);
        this.handleClearSearchAndClose = this.handleClearSearch.bind(this, true);

        this.searchForm = null;
        this.lowAmountInput = null;
        this.highAmountInput = null;
        this.lowDatePicker = null;
        this.highDatePicker = null;
    }

    handleClearSearch(close, event) {
        this.searchForm.reset();
        this.lowAmountInput.clear();
        this.highAmountInput.clear();
        this.lowDatePicker.clear();
        this.highDatePicker.clear();
        this.props.resetAll(!close);
        event.preventDefault();
    }

    handleToggleDetails() {
        this.props.toggleSearchDetails();
    }

    componentWillUnmount() {
        this.props.resetAll(false);
    }

    render() {
        let showDetails = this.props.displaySearchDetails;
        let details;
        if (!showDetails) {
            details = <div className="transition-expand" />;
        } else {
            let catOptions = [
                <option
                  key="_"
                  value="">
                    { $t('client.search.any_category') }
                </option>
            ].concat(
                this.props.categories.map(
                    c => (
                        <option
                          key={ c.id }
                          value={ c.id }>
                            { c.title }
                        </option>
                    )
                )
            );

            let typeOptions = [
                <option
                  key="_"
                  value="">
                    { $t('client.search.any_type') }
                </option>
            ].concat(
                this.props.operationTypes.map(type =>
                    <option
                      key={ type.name }
                      value={ type.name }>
                        { $t(`client.${type.name}`) }
                    </option>
                )
            );

            let handleKeyword = event => {
                this.props.setKeywords(event.target.value);
            };
            let handleCategory = event => {
                this.props.setCategoryId(event.target.value);
            };
            let handleOperationType = event => {
                this.props.setType(event.target.value);
            };
            let handleAmountLow = value => {
                this.props.setAmountLow(Number.isNaN(value) ? null : value);
            };
            let handleAmountHigh = value => {
                this.props.setAmountHigh(Number.isNaN(value) ? null : value);
            };
            let handleDateLow = value => this.props.setDateLow(value);
            let handleDateHigh = value => this.props.setDateHigh(value);

            let refSearchForm = node => {
                this.searchForm = node;
            };
            let refLowAmountInput = node => {
                this.lowAmountInput = node;
            };
            let refHighAmountInput = node => {
                this.highAmountInput = node;
            };
            let refLowDatePicker = node => {
                this.lowDatePicker = node;
            };
            let refHighDatePicker = node => {
                this.highDatePicker = node;
            };

            details = (
                <form
                  className="panel-body transition-expand"
                  ref={ refSearchForm }>

                    <div className="form-group">
                        <label htmlFor="keywords">
                            { $t('client.search.keywords') }
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          onKeyUp={ handleKeyword }
                          id="keywords"
                        />
                    </div>

                    <div className="form-horizontal">
                        <div className="form-group">
                            <div className="col-xs-4 col-md-2">
                                <label htmlFor="category-selector">
                                    { $t('client.search.category') }
                                </label>
                            </div>
                            <div className="col-xs-8 col-md-5">
                                <select
                                  className="form-control"
                                  id="category-selector"
                                  defaultValue={ this.props.searchFields.categoryId }
                                  onChange={ handleCategory }>
                                    { catOptions }
                                </select>
                            </div>
                            <div className="col-xs-4 col-md-1">
                                <label htmlFor="type-selector">
                                    { $t('client.search.type') }
                                </label>
                            </div>
                            <div className="col-xs-8 col-md-4">
                                <select
                                  className="form-control"
                                  id="type-selector"
                                  onChange={ handleOperationType }>
                                    { typeOptions }
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-horizontal">
                        <div className="form-group">
                            <div className="col-xs-12 col-md-1">
                                <label
                                  className="control-label"
                                  htmlFor="amount-low">
                                    <span>{ $t('client.search.amount_low') }</span>
                                </label>
                            </div>
                            <div className="col-xs-4 col-md-1">
                                <label
                                  className="control-label"
                                  htmlFor="amount-low">
                                    <span>{ $t('client.search.between') }</span>
                                </label>
                            </div>
                            <div className="col-xs-8 col-md-5">
                                <AmountInput
                                  onChange={ handleAmountLow }
                                  id="amount-low"
                                  ref={ refLowAmountInput }
                                  signId="search-sign-amount-low"
                                />
                            </div>
                            <div className="col-xs-4 col-md-1">
                                <label
                                  className="control-label"
                                  htmlFor="amount-high">
                                    { $t('client.search.and') }
                                </label>
                            </div>
                            <div className="col-xs-8 col-md-4">
                                <AmountInput
                                  onChange={ handleAmountHigh }
                                  id="amount-high"
                                  ref={ refHighAmountInput }
                                  signId="search-sign-amount-high"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-horizontal">
                        <div className="form-group">
                            <div className="col-xs-12 col-md-1">
                                <label
                                  className="control-label"
                                  htmlFor="date-low">
                                    <span>{ $t('client.search.date_low') }</span>
                                </label>
                            </div>
                            <div className="col-xs-4 col-md-1">
                                <label
                                  className="control-label"
                                  htmlFor="date-low">
                                    <span>{ $t('client.search.between') }</span>
                                </label>
                            </div>
                            <div className="col-xs-8 col-md-5">
                                <DatePicker
                                  id="date-low"
                                  key="date-low"
                                  ref={ refLowDatePicker }
                                  onSelect={ handleDateLow }
                                  defaultValue={ this.props.searchFields.dateLow }
                                  maxDate={ this.props.searchFields.dateHigh }
                                />
                            </div>
                            <div className="col-xs-4 col-md-1">
                                <label
                                  className="control-label"
                                  htmlFor="date-high">
                                    { $t('client.search.and') }
                                </label>
                            </div>
                            <div className="col-xs-8 col-md-4">
                                <DatePicker
                                  id="date-high"
                                  key="date-high"
                                  ref={ refHighDatePicker }
                                  onSelect={ handleDateHigh }
                                  defaultValue={ this.props.searchFields.dateHigh }
                                  minDate={ this.props.searchFields.dateLow }
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                          className="btn btn-warning pull-left"
                          type="button"
                          onClick={ this.handleClearSearchAndClose }>
                            { $t('client.search.clearAndClose') }
                        </button>
                        <button
                          className="btn btn-warning pull-right"
                          type="button"
                          onClick={ this.handleClearSearchNoClose }>
                            { $t('client.search.clear') }
                        </button>
                    </div>

                </form>
            );
        }

        return (
            <div className="panel panel-default">
                <div
                  className="panel-heading clickable"
                  onClick={ this.handleToggleDetails }>
                    <h5 className="panel-title">
                        { $t('client.search.title') }
                        <span
                          className={ `pull-right fa fa-${showDetails ?
                          'minus' : 'plus'}-square` }
                          aria-hidden="true"
                        />
                    </h5>
                </div>
                { details }
            </div>
        );

    }
}

const Export = connect(state => {
    // Put none category juste after any_category
    let categories = get.categories(state);
    let unknownCategory = categories.find(cat => cat.id === NONE_CATEGORY_ID);
    categories = [unknownCategory].concat(categories.filter(cat => cat.id !== NONE_CATEGORY_ID));

    // Put unknown_type juste after any_type
    let types = get.types(state);
    let unknownType = types.find(type => type.name === UNKNOWN_OPERATION_TYPE);
    types = [unknownType].concat(types.filter(type => type.name !== UNKNOWN_OPERATION_TYPE));

    return {
        categories,
        operationTypes: types,
        searchFields: get.searchFields(state),
        displaySearchDetails: get.displaySearchDetails(state)
    };
}, dispatch => {
    return {
        setKeywords(keywordsString) {
            let keywords = keywordsString.trim();
            if (keywords.length)
                keywords = keywords.split(' ').map(w => w.toLowerCase());
            else
                keywords = [];
            actions.setSearchField(dispatch, 'keywords', keywords);
        },

        setCategoryId(categoryId) {
            actions.setSearchField(dispatch, 'categoryId', categoryId);
        },

        setType(type) {
            actions.setSearchField(dispatch, 'type', type);
        },

        setAmountLow(amountLow) {
            actions.setSearchField(dispatch, 'amountLow', amountLow);
        },

        setAmountHigh(amountHigh) {
            actions.setSearchField(dispatch, 'amountHigh', amountHigh);
        },

        setDateLow(dateLow) {
            actions.setSearchField(dispatch, 'dateLow', dateLow);
        },

        setDateHigh(dateHigh) {
            actions.setSearchField(dispatch, 'dateHigh', dateHigh);
        },

        resetAll(showDetails) {
            actions.resetSearch(dispatch);
            actions.toggleSearchDetails(dispatch, showDetails);
        },

        toggleSearchDetails() {
            actions.toggleSearchDetails(dispatch);
        }
    };
})(SearchComponent);

export default Export;
