import React from 'react';

import { connect } from 'react-redux';

import { translate as $t, UNKNOWN_OPERATION_TYPE, NONE_CATEGORY_ID } from '../../helpers';
import { get, actions } from '../../store';

import DatePicker from '../ui/date-picker';
import AmountInput from '../ui/amount-input';

class SearchComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { showDetails: false };
        this.handleToggleDetails = this.handleToggleDetails.bind(this);
        this.handleClearSearchNoClose = this.handleClearSearch.bind(this, false);
        this.handleClearSearchAndClose = this.handleClearSearch.bind(this, true);
    }

    handleClearSearch(close, event) {
        this.setState({ showDetails: !close });
        this.refs.searchForm.reset();
        this.refs.amount_low.clear();
        this.refs.amount_high.clear();
        this.props.resetAll();
        event.preventDefault();
    }

    handleToggleDetails() {
        this.setState({
            showDetails: !this.state.showDetails
        });
    }

    render() {
        let details;
        if (!this.state.showDetails) {
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

            let handleKeyword = () => this.props.setKeywords(this.refs.keywords.value);
            let hanldeCategory = () => this.props.setCategoryId(this.refs.cat.value);
            let handleOperationType = () => this.props.setType(this.refs.type.value);
            let handleAmountLow = value => {
                this.props.setAmountLow(Number.isNaN(value) ? null : value);
            };
            let handleAmountHigh = value => {
                this.props.setAmountHigh(Number.isNaN(value) ? null : value);
            };
            let handleDateLow = value => this.props.setDateLow(value);
            let handleDateHigh = value => this.props.setDateHigh(value);
            details = (
                <form
                  className="panel-body transition-expand"
                  ref="searchForm">

                    <div className="form-group">
                        <label htmlFor="keywords">
                            { $t('client.search.keywords') }
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          onKeyUp={ handleKeyword }
                          id="keywords"
                          ref="keywords"
                        />
                    </div>

                    <div className="form-horizontal">
                        <div className="form-group">
                            <div className="col-xs-2">
                                <label htmlFor="category-selector">
                                    { $t('client.search.category') }
                                </label>
                            </div>
                            <div className="col-xs-5">
                                <select
                                  className="form-control"
                                  id="category-selector"
                                  defaultValue={ this.props.searchFields.categoryId }
                                  onChange={ hanldeCategory }
                                  ref="cat">
                                    { catOptions }
                                </select>
                            </div>
                            <div className="col-xs-1">
                                <label htmlFor="type-selector">
                                    { $t('client.search.type') }
                                </label>
                            </div>
                            <div className="col-xs-4">
                                <select
                                  className="form-control"
                                  id="type-selector"
                                  onChange={ handleOperationType }
                                  ref="type">
                                    { typeOptions }
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-horizontal">
                        <div className="form-group">
                            <div className="col-xs-2">
                                <label
                                  className="control-label"
                                  htmlFor="amount-low">
                                    { $t('client.search.amount_low') }
                                </label>
                            </div>
                            <div className="col-xs-5">
                                <AmountInput
                                  onChange={ handleAmountLow }
                                  id="amount-low"
                                  ref="amount_low"
                                  signId="amount_low"
                                />
                            </div>
                            <div className="col-xs-1">
                                <label
                                  className="control-label"
                                  htmlFor="amount-high">
                                    { $t('client.search.and') }
                                </label>
                            </div>
                            <div className="col-xs-4">
                                <AmountInput
                                  onChange={ handleAmountHigh }
                                  id="amount-high"
                                  ref="amount_high"
                                  signId="amount_high"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-horizontal">
                        <div className="form-group">
                            <div className="col-xs-2">
                                <label
                                  className="control-label"
                                  htmlFor="date-low">
                                    { $t('client.search.date_low') }
                                </label>
                            </div>
                            <div className="col-xs-5">
                                <DatePicker
                                  ref="date_low"
                                  id="date-low"
                                  key="date-low"
                                  onSelect={ handleDateLow }
                                  defaultValue={ this.props.searchFields.dateLow }
                                  maxDate={ this.props.searchFields.dateHigh }
                                />
                            </div>
                            <div className="col-xs-1">
                                <label
                                  className="control-label"
                                  htmlFor="date-high">
                                    { $t('client.search.and') }
                                </label>
                            </div>
                            <div className="col-xs-4">
                                <DatePicker
                                  ref="date_high"
                                  id="date-high"
                                  key="date-high"
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
                          className={ `pull-right fa fa-${this.state.showDetails ?
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
        searchFields: get.searchFields(state)
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

        resetAll() {
            actions.resetSearch(dispatch);
        }
    };
})(SearchComponent);

export default Export;
