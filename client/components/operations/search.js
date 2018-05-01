import React from 'react';
import Select from 'react-select';

import moment from 'moment';

import { connect } from 'react-redux';

import { translate as $t, UNKNOWN_OPERATION_TYPE, NONE_CATEGORY_ID } from '../../helpers';
import { get, actions } from '../../store';

import AmountInput from '../ui/amount-input';
import DatePicker from '../ui/date-picker';
import FoldablePanel from '../ui/foldable-panel';

const ANY_TYPE_ID = '';

const SearchTypeSelect = connect(
    state => {
        return {
            defaultValue: get.searchFields(state).type,
            types: get.types(state)
        };
    },
    dispatch => {
        return {
            handleOperationType: selectedValue => {
                let value = ANY_TYPE_ID;
                if (selectedValue) {
                    value = selectedValue.value;
                }
                actions.setSearchField(dispatch, 'type', value);
            }
        };
    }
)(props => {
    let unknownType = props.types.find(type => type.name === UNKNOWN_OPERATION_TYPE);

    // Types are not sorted.
    let types = [unknownType].concat(
        props.types.filter(type => type.name !== UNKNOWN_OPERATION_TYPE)
    );

    let typeOptions = [
        {
            value: ANY_TYPE_ID,
            label: $t('client.search.any_type')
        }
    ].concat(
        types.map(type => ({
            value: type.name,
            label: $t(`client.${type.name}`)
        }))
    );

    return (
        <Select
            className="form-element-block"
            onChange={props.handleOperationType}
            options={typeOptions}
            value={props.defaultValue}
        />
    );
});

const ANY_CATEGORY_ID = '';

const SearchCategorySelect = connect(
    state => {
        return {
            defaultValue: get.searchFields(state).categoryId,
            categories: get.categories(state)
        };
    },
    dispatch => {
        return {
            handleChange(selectedValue) {
                let value = ANY_CATEGORY_ID;
                if (selectedValue) {
                    value = selectedValue.value;
                }
                actions.setSearchField(dispatch, 'categoryId', value);
            }
        };
    }
)(props => {
    let noneCategory = props.categories.find(cat => cat.id === NONE_CATEGORY_ID);
    let categories = props.categories.filter(cat => cat.id !== NONE_CATEGORY_ID);

    let options = [
        {
            value: ANY_CATEGORY_ID,
            label: $t('client.search.any_category')
        },
        {
            value: noneCategory.id,
            label: noneCategory.title
        }
    ].concat(categories.map(cat => ({ value: cat.id, label: cat.title })));

    return <Select value={props.defaultValue} onChange={props.handleChange} options={options} />;
});

const MinDatePicker = connect(
    (state, props) => {
        return {
            value: get.searchFields(state).dateLow,
            maxDate: get.searchFields(state).dateHigh,
            ref: props.refCb
        };
    },
    dispatch => {
        return {
            onSelect(rawDateLow) {
                let dateLow = null;
                if (rawDateLow) {
                    dateLow = +moment(rawDateLow).startOf('day');
                }
                actions.setSearchField(dispatch, 'dateLow', dateLow);
            }
        };
    }
)(DatePicker);

const MaxDatePicker = connect(
    (state, props) => {
        return {
            value: get.searchFields(state).dateHigh,
            minDate: get.searchFields(state).dateLow,
            ref: props.refCb
        };
    },
    dispatch => {
        return {
            onSelect(rawDateHigh) {
                let dateHigh = null;
                if (rawDateHigh) {
                    dateHigh = +moment(rawDateHigh).endOf('day');
                }
                actions.setSearchField(dispatch, 'dateHigh', dateHigh);
            }
        };
    }
)(DatePicker);

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
        this.props.resetAll();
        if (close) {
            this.refSearchPanel.handleToggleExpand();
        }
        event.preventDefault();
    }

    componentWillUnmount() {
        this.props.resetAll(false);
    }

    render() {
        let handleKeyword = event => {
            this.props.setKeywords(event.target.value);
        };
        let handleAmountLow = value => {
            this.props.setAmountLow(Number.isNaN(value) ? null : value);
        };
        let handleAmountHigh = value => {
            this.props.setAmountHigh(Number.isNaN(value) ? null : value);
        };

        let refSearchPanel = node => {
            this.refSearchPanel = node;
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

        return (
            <FoldablePanel
                className="search-panel"
                title={$t('client.search.title')}
                initiallyExpanded={this.props.displaySearchDetails}
                ref={refSearchPanel}>
                <form ref={refSearchForm} className="search">
                    <p className="search-keywords">
                        <label htmlFor="keywords">{$t('client.search.keywords')}</label>

                        <input
                            type="text"
                            className="form-element-block"
                            onChange={handleKeyword}
                            id="keywords"
                        />
                    </p>

                    <div className="search-categories-types">
                        <label htmlFor="category-selector">{$t('client.search.category')}</label>

                        <SearchCategorySelect id="category-selector" />

                        <label htmlFor="type-selector">{$t('client.search.type')}</label>

                        <SearchTypeSelect id="type-selector" />
                    </div>

                    <div className="search-amounts">
                        <label htmlFor="amount-low">{$t('client.search.amount_low')}</label>

                        <AmountInput
                            onChange={handleAmountLow}
                            id="amount-low"
                            ref={refLowAmountInput}
                            signId="search-sign-amount-low"
                        />

                        <label htmlFor="amount-high">{$t('client.search.amount_high')}</label>

                        <AmountInput
                            onChange={handleAmountHigh}
                            id="amount-high"
                            ref={refHighAmountInput}
                            signId="search-sign-amount-high"
                        />
                    </div>

                    <div className="search-dates">
                        <label htmlFor="date-low">{$t('client.search.date_low')}</label>

                        <MinDatePicker id="date-low" refCb={refLowDatePicker} />

                        <label htmlFor="date-high">{$t('client.search.date_high')}</label>

                        <MaxDatePicker id="date-high" refCb={refHighDatePicker} />
                    </div>

                    <p className="search-buttons">
                        <button
                            className="btn btn-warning"
                            type="button"
                            onClick={this.handleClearSearchAndClose}>
                            {$t('client.search.clearAndClose')}
                        </button>
                        <button
                            className="btn btn-warning"
                            type="button"
                            onClick={this.handleClearSearchNoClose}>
                            {$t('client.search.clear')}
                        </button>
                    </p>
                </form>
            </FoldablePanel>
        );
    }
}

const Export = connect(
    state => {
        return {
            displaySearchDetails: get.displaySearchDetails(state)
        };
    },
    dispatch => {
        return {
            setKeywords(keywordsString) {
                let keywords = keywordsString.trim();
                if (keywords.length) {
                    keywords = keywords.split(' ').map(w => w.toLowerCase());
                } else {
                    keywords = [];
                }
                actions.setSearchField(dispatch, 'keywords', keywords);
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
    }
)(SearchComponent);

export default Export;
