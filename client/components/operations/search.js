import React from 'react';

import moment from 'moment';

import { connect } from 'react-redux';

import { translate as $t, UNKNOWN_OPERATION_TYPE, NONE_CATEGORY_ID } from '../../helpers';
import { get, actions } from '../../store';

import AmountInput from '../ui/amount-input';
import ClearableInput from '../ui/clearable-input';
import DatePicker from '../ui/date-picker';
import FuzzyOrNativeSelect from '../ui/fuzzy-or-native-select';

const ANY_TYPE_ID = '';

function typeNotFoundMessage() {
    return $t('client.operations.no_type_found');
}

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
                let value = selectedValue !== null ? selectedValue : ANY_TYPE_ID;
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
        <FuzzyOrNativeSelect
            clearable={true}
            noOptionsMessage={typeNotFoundMessage}
            onChange={props.handleOperationType}
            options={typeOptions}
            value={props.defaultValue}
        />
    );
});

function categoryNotFoundMessage() {
    return $t('client.operations.no_category_found');
}

const SearchCategorySelect = connect(
    state => {
        return {
            defaultValue: get.searchFields(state).categoryIds,
            categories: get.categories(state)
        };
    },
    dispatch => {
        return {
            handleChange(selectedValue) {
                let value = selectedValue instanceof Array ? selectedValue : [];
                actions.setSearchField(dispatch, 'categoryIds', value);
            }
        };
    }
)(props => {
    let noneCategory = props.categories.find(cat => cat.id === NONE_CATEGORY_ID);
    let categories = props.categories.filter(cat => cat.id !== NONE_CATEGORY_ID);

    let options = [
        {
            value: noneCategory.id,
            label: noneCategory.label
        }
    ].concat(categories.map(cat => ({ value: cat.id, label: cat.label })));

    return (
        <FuzzyOrNativeSelect
            clearable={true}
            noOptionsMessage={categoryNotFoundMessage}
            onChange={props.handleChange}
            options={options}
            value={props.defaultValue}
            isMulti={true}
            placeholder={$t('client.search.category_placeholder')}
        />
    );
});

const MinDatePicker = connect(
    state => {
        return {
            value: get.searchFields(state).dateLow,
            maxDate: get.searchFields(state).dateHigh
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
    state => {
        return {
            value: get.searchFields(state).dateHigh,
            minDate: get.searchFields(state).dateLow
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
    }

    refKeywordsInput = React.createRef();
    refLowAmountInput = React.createRef();
    refHighAmountInput = React.createRef();

    handleKeyword = value => {
        this.props.setKeywords(value);
    };

    handleAmountLow = value => {
        this.props.setAmountLow(Number.isNaN(value) ? null : value);
    };

    handleAmountHigh = value => {
        this.props.setAmountHigh(Number.isNaN(value) ? null : value);
    };

    handleClearSearch(close, event) {
        this.refKeywordsInput.current.clear();
        this.refLowAmountInput.current.clear();
        this.refHighAmountInput.current.clear();
        this.props.resetAll(!close);

        event.preventDefault();
    }

    componentWillUnmount() {
        this.props.resetAll(false);
    }

    render() {
        return (
            <form className="search" hidden={!this.props.displaySearchDetails}>
                <div className="search-keywords">
                    <label htmlFor="keywords">{$t('client.search.keywords')}</label>

                    <ClearableInput
                        ref={this.refKeywordsInput}
                        onChange={this.handleKeyword}
                        id="keywords"
                    />
                </div>

                <div className="search-categories-types">
                    <label>{$t('client.search.category')}</label>

                    <SearchCategorySelect />

                    <label>{$t('client.search.type')}</label>

                    <SearchTypeSelect />
                </div>

                <div className="search-amounts">
                    <label htmlFor="amount-low">{$t('client.search.amount_low')}</label>

                    <AmountInput
                        onChange={this.handleAmountLow}
                        id="amount-low"
                        ref={this.refLowAmountInput}
                        signId="search-sign-amount-low"
                    />

                    <label htmlFor="amount-high">{$t('client.search.amount_high')}</label>

                    <AmountInput
                        onChange={this.handleAmountHigh}
                        id="amount-high"
                        ref={this.refHighAmountInput}
                        signId="search-sign-amount-high"
                    />
                </div>

                <div className="search-dates">
                    <label htmlFor="date-low">{$t('client.search.date_low')}</label>

                    <MinDatePicker id="date-low" />

                    <label htmlFor="date-high">{$t('client.search.date_high')}</label>

                    <MaxDatePicker id="date-high" />
                </div>

                <p className="search-buttons">
                    <button
                        className="btn warning"
                        type="button"
                        onClick={this.handleClearSearchNoClose}>
                        {$t('client.search.clear')}
                    </button>
                    <button
                        className="btn warning"
                        type="button"
                        onClick={this.handleClearSearchAndClose}>
                        {$t('client.search.clearAndClose')}
                    </button>
                </p>
            </form>
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
