import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import { translate as $t, UNKNOWN_OPERATION_TYPE, NONE_CATEGORY_ID } from '../../helpers';
import { get, actions } from '../../store';

import AmountInput from '../ui/amount-input';
import DatePicker from '../ui/date-picker';
import FoldablePanel from '../ui/foldable-panel';

const SearchCategorySelect = connect(state => {
    return {
        defaultValue: get.searchFields(state).categoryId,
        categories: get.categories(state)
    };
}, dispatch => {
    return {
        handleChange(event) {
            actions.setSearchField(dispatch, 'categoryId', event.target.value);
        }
    };
})(props => {
    let { defaultValue, categories, handleChange } = props;

    let noneCategory = categories.find(cat => cat.id === NONE_CATEGORY_ID);
    categories = categories.filter(cat => cat.id !== NONE_CATEGORY_ID);

    let options = [
        <option
          key="_"
          value="">
            { $t('client.search.any_category') }
        </option>,
        <option
          key={ noneCategory.id }
          value={ noneCategory.id }>
            { noneCategory.title }
        </option>
    ].concat(categories.map(cat => (
        <option
          key={ cat.id }
          value={ cat.id }>
            { cat.title }
        </option>
    )));

    return (
        <select
          className="form-control"
          id={ props.id }
          defaultValue={ defaultValue }
          onChange={ handleChange }>
            { options }
        </select>
    );
});

SearchCategorySelect.propTypes = {
    // A string to link the input to a label for exemple.
    id: PropTypes.string
};

class SearchComponent extends React.Component {
    constructor(props) {
        super(props);
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
        this.props.resetAll();
        if (close)
            this.refSearchPanel.handleToggleExpand();
        event.preventDefault();
    }

    componentWillUnmount() {
        this.props.resetAll(false);
    }

    render() {

        let unknownType = this.props.types.find(type => type.name === UNKNOWN_OPERATION_TYPE);

        // The types are not sorted as they are already sorted by key, which
        // happens to be the same order as once translated in french or english.
        let types = [unknownType].concat(this.props.types.filter(type =>
            type.name !== UNKNOWN_OPERATION_TYPE)
        );
        let typeOptions = [
            <option
              key="_"
              value="">
                { $t('client.search.any_type') }
            </option>
        ].concat(
            types.map(type => (
                <option
                  key={ type.name }
                  value={ type.name }>
                    { $t(`client.${type.name}`) }
                </option>
            ))
        );

        let handleKeyword = event => {
            this.props.setKeywords(event.target.value);
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
        let refSearchPanel = node => {
            this.refSearchPanel = node;
        };

        return (
            <FoldablePanel
              title={ $t('client.search.title') }
              initiallyExpanded={ this.props.displaySearchDetails }
              top={ false }
              ref={ refSearchPanel }>
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
                                <SearchCategorySelect id="category-selector" />
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
                                <MinDatePicker
                                  id="date-low"
                                  refCb={ refLowDatePicker }
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
                                <MaxDatePicker
                                  id="date-high"
                                  refCb={ refHighDatePicker }
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
            </FoldablePanel>
        );

    }
}

const MinDatePicker = connect((state, props) => {
    return {
        defaultValue: get.searchFields(state).dateLow,
        maxDate: get.searchFields(state).dateHigh,
        ref: props.refCb
    };
}, dispatch => {
    return {
        onSelect(dateLow) {
            actions.setSearchField(dispatch, 'dateLow', dateLow);
        }
    };
})(DatePicker);

const MaxDatePicker = connect((state, props) => {
    return {
        defaultValue: get.searchFields(state).dateHigh,
        minDate: get.searchFields(state).dateLow,
        ref: props.refCb
    };
}, dispatch => {
    return {
        onSelect(dateHigh) {
            actions.setSearchField(dispatch, 'dateHigh', dateHigh);
        }
    };
})(DatePicker);

const Export = connect(state => {
    return {
        types: get.types(state),
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

        setType(type) {
            actions.setSearchField(dispatch, 'type', type);
        },

        setAmountLow(amountLow) {
            actions.setSearchField(dispatch, 'amountLow', amountLow);
        },

        setAmountHigh(amountHigh) {
            actions.setSearchField(dispatch, 'amountHigh', amountHigh);
        },

        resetAll(showDetails) {
            actions.resetSearch(dispatch);
            actions.toggleSearchDetails(dispatch, showDetails);
        }
    };
})(SearchComponent);

export default Export;
