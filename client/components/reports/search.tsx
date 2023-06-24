import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import debounce from 'lodash.debounce';

import {
    translate as $t,
    UNKNOWN_TRANSACTION_TYPE,
    NONE_CATEGORY_ID,
    startOfDay,
    endOfDay,
    useKresusState,
    assert,
} from '../../helpers';
import { get, actions } from '../../store';
import URL from '../../urls';

import ClearableInput, { ClearableInputRef } from '../ui/clearable-input';
import DatePicker from '../ui/date-picker';
import FuzzyOrNativeSelect from '../ui/fuzzy-or-native-select';
import MultipleSelect from '../ui/multiple-select';
import MinMaxInput, { MinMaxInputRef } from '../ui/min-max-input';

import './search.css';
import { matchPath, useHistory } from 'react-router-dom';

// Debouncing for input events (ms).
const INPUT_DEBOUNCING = 150;

const ANY_TYPE_ID = '';

function typeNotFoundMessage() {
    return $t('client.transactions.no_type_found');
}

const SearchTypeSelect = (props: { id: string }) => {
    const defaultValue = useKresusState(state => get.searchFields(state).type);
    const types = useKresusState(state => get.types(state));

    const dispatch = useDispatch();
    const handleTransactionType = useCallback(
        (newValue: string | null) => {
            const value = newValue !== null ? newValue : ANY_TYPE_ID;
            actions.setSearchFields(dispatch, { type: value });
        },
        [dispatch]
    );

    const options = useMemo(() => {
        const unknownType = types.find(type => type.name === UNKNOWN_TRANSACTION_TYPE);
        assert(typeof unknownType !== 'undefined', 'none type exists');

        // Types are not sorted.
        const allTypes = [unknownType].concat(
            types.filter(type => type.name !== UNKNOWN_TRANSACTION_TYPE)
        );

        return [
            {
                value: ANY_TYPE_ID,
                label: $t('client.search.any_type'),
            },
        ].concat(
            allTypes.map(type => ({
                value: type.name,
                label: $t(`client.${type.name}`),
            }))
        );
    }, [types]);

    return (
        <FuzzyOrNativeSelect
            clearable={true}
            noOptionsMessage={typeNotFoundMessage}
            onChange={handleTransactionType}
            options={options}
            value={defaultValue}
            id={props.id}
        />
    );
};

function categoryNotFoundMessage() {
    return $t('client.transactions.no_category_found');
}

const SearchCategorySelect = (props: { id: string }) => {
    const values = useKresusState(state => get.searchFields(state).categoryIds);
    const categories = useKresusState(state => get.categories(state));

    const dispatch = useDispatch();
    const handleChange = useCallback(
        (newValue: (string | number)[]) => {
            assert(
                newValue.every(x => typeof x === 'number'),
                'only numbers'
            );
            const value = newValue as number[];
            actions.setSearchFields(dispatch, { categoryIds: value });
        },
        [dispatch]
    );

    const options = useMemo(() => {
        const noneCategory = categories.find(cat => cat.id === NONE_CATEGORY_ID);
        assert(typeof noneCategory !== 'undefined', 'none category exists');
        const otherCategories = categories.filter(cat => cat.id !== NONE_CATEGORY_ID);
        return [
            {
                value: noneCategory.id,
                label: noneCategory.label,
            },
        ].concat(otherCategories.map(cat => ({ value: cat.id, label: cat.label })));
    }, [categories]);

    return (
        <MultipleSelect
            noOptionsMessage={categoryNotFoundMessage}
            onChange={handleChange}
            options={options}
            values={values}
            placeholder={$t('client.search.category_placeholder', values.length)}
            id={props.id}
        />
    );
};

const MinDatePicker = (props: { id: string }) => {
    const value = useKresusState(state => get.searchFields(state).dateLow);
    const maxDate = useKresusState(state => get.searchFields(state).dateHigh || undefined);
    const dispatch = useDispatch();
    const onSelect = useCallback(
        (rawDateLow: Date | null) => {
            let dateLow = null;
            if (rawDateLow) {
                dateLow = startOfDay(new Date(rawDateLow));
            }
            actions.setSearchFields(dispatch, { dateLow });
        },
        [dispatch]
    );
    return (
        <DatePicker
            id={props.id}
            value={value}
            maxDate={maxDate}
            onSelect={onSelect}
            clearable={true}
        />
    );
};

const MaxDatePicker = (props: { id: string }) => {
    const value = useKresusState(state => get.searchFields(state).dateHigh);
    const minDate = useKresusState(state => get.searchFields(state).dateLow || undefined);
    const dispatch = useDispatch();
    const onSelect = useCallback(
        (rawDateHigh: Date | null) => {
            let dateHigh = null;
            if (rawDateHigh) {
                dateHigh = endOfDay(new Date(rawDateHigh));
            }
            actions.setSearchFields(dispatch, { dateHigh });
        },
        [dispatch]
    );
    return (
        <DatePicker
            id={props.id}
            value={value}
            minDate={minDate}
            onSelect={onSelect}
            clearable={true}
        />
    );
};

const SearchComponent = (props: { minAmount: number; maxAmount: number }) => {
    const history = useHistory();
    const displaySearchDetails = useKresusState(state => get.displaySearchDetails(state));
    const searchFields = useKresusState(state => get.searchFields(state));

    const dispatch = useDispatch();

    const setKeywords = useCallback(
        (keywordsString: string) => {
            const trimmed = keywordsString.trim();
            let keywords: string[];
            if (trimmed.length) {
                keywords = trimmed.split(' ').map((w: string) => w.toLowerCase());
            } else {
                keywords = [];
            }
            actions.setSearchFields(dispatch, { keywords });
        },
        [dispatch]
    );

    const setAmountLowHigh = useCallback(
        (low: number | null, high: number | null) => {
            actions.setSearchFields(dispatch, {
                amountLow: low,
                amountHigh: high,
            });
        },
        [dispatch]
    );

    const resetAll = useCallback(
        (showDetails: boolean) => {
            actions.resetSearch(dispatch);
            actions.toggleSearchDetails(dispatch, showDetails);
        },
        [dispatch]
    );

    const refKeywordsInput = React.createRef<ClearableInputRef>();
    const refMinMaxInput = React.createRef<MinMaxInputRef>();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleKeyword = useCallback(
        debounce(
            (value: string) => {
                setKeywords(value);
            },
            INPUT_DEBOUNCING,
            { trailing: true }
        ),
        [setKeywords]
    );

    const handleClearSearch = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();

            const keywords = refKeywordsInput.current;
            assert(keywords !== null, 'keywords ref set');
            keywords.clear();

            const minMax = refMinMaxInput.current;
            assert(minMax !== null, 'min max ref set');
            minMax.clear();
        },
        [refKeywordsInput, refMinMaxInput]
    );

    const handleClearSearchNoClose = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            handleClearSearch(event);
            resetAll(true);
        },
        [handleClearSearch, resetAll]
    );

    const handleClearSearchAndClose = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            handleClearSearch(event);
            resetAll(false);
        },
        [handleClearSearch, resetAll]
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleMinMaxChange = useCallback(
        debounce((low: number | null, high: number | null) => {
            // Don't trigger a false rerender if the values haven't changed.
            if (searchFields.amountLow !== low || searchFields.amountHigh !== high) {
                setAmountLowHigh(low, high);
            }
        }, INPUT_DEBOUNCING),
        [searchFields, setAmountLowHigh]
    );

    useEffect(() => {
        return () => {
            // On unmount, reset the search, unless we're going to a
            // transaction's detail page. We already know what the next path
            // will be, because this effect is triggered asynchronously, after
            // we've requested to leave the current route/component.
            const nextPath = history.location.pathname;
            if (matchPath(nextPath, URL.transactions.pattern) === null) {
                resetAll(false);
            }
        };
    }, [resetAll, history]);

    return (
        <form className="search" hidden={!displaySearchDetails}>
            <div className="search-keywords">
                <label htmlFor="keywords">{$t('client.search.keywords')}</label>

                <ClearableInput
                    ref={refKeywordsInput}
                    onChange={handleKeyword}
                    value={searchFields.keywords.join(' ')}
                    id="keywords"
                />
            </div>

            <div className="search-categories-types">
                <label htmlFor="search-type">{$t('client.search.type')}</label>

                <SearchTypeSelect id="search-type" />

                <label htmlFor="search-category">{$t('client.search.category')}</label>

                <SearchCategorySelect id="search-category" />
            </div>

            <div className="search-amounts">
                <label>{$t('client.search.amount')}</label>
                <MinMaxInput
                    low={searchFields.amountLow}
                    high={searchFields.amountHigh}
                    min={props.minAmount}
                    max={props.maxAmount}
                    onChange={handleMinMaxChange}
                    ref={refMinMaxInput}
                />
            </div>

            <div className="search-dates">
                <label htmlFor="date-low">{$t('client.search.date_low')}</label>

                <MinDatePicker id="date-low" />

                <label htmlFor="date-high">{$t('client.search.date_high')}</label>

                <MaxDatePicker id="date-high" />
            </div>

            <p className="search-buttons">
                <button className="btn warning" type="button" onClick={handleClearSearchNoClose}>
                    {$t('client.search.clear')}
                </button>
                <button className="btn warning" type="button" onClick={handleClearSearchAndClose}>
                    {$t('client.search.clearAndClose')}
                </button>
            </p>
        </form>
    );
};

export default SearchComponent;
