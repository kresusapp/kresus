import React, { useCallback, useEffect, useMemo } from 'react';
import debounce from 'lodash.debounce';

import {
    translate as $t,
    UNKNOWN_TRANSACTION_TYPE,
    NONE_CATEGORY_ID,
    startOfDay,
    endOfDay,
    assert,
} from '../../helpers';
import { useKresusDispatch, useKresusState } from '../../store';
import * as CategoriesStore from '../../store/categories';
import * as BanksStore from '../../store/banks';
import * as UiStore from '../../store/ui';
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
    const defaultValue = useKresusState(state => UiStore.getSearchFields(state.ui).type);
    const types = useKresusState(state => BanksStore.allTypes(state.banks));

    const dispatch = useKresusDispatch();
    const handleTransactionType = useCallback(
        (newValue: string | null) => {
            const value = newValue !== null ? newValue : ANY_TYPE_ID;
            dispatch(UiStore.setSearchFields({ type: value }));
        },
        [dispatch]
    );

    const options = useMemo(() => {
        const unknownType = types.find(type => type.name === UNKNOWN_TRANSACTION_TYPE);
        assert(typeof unknownType !== 'undefined', 'none type exists');

        // Types are not sorted.
        const knownTypes = [unknownType].concat(
            types.filter(type => type.name !== UNKNOWN_TRANSACTION_TYPE)
        );

        return [
            {
                value: ANY_TYPE_ID,
                label: $t('client.search.any_type'),
            },
        ].concat(
            knownTypes.map(type => ({
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
    const values = useKresusState(state => UiStore.getSearchFields(state.ui).categoryIds);
    const categories = useKresusState(state => CategoriesStore.all(state.categories));

    const dispatch = useKresusDispatch();
    const handleChange = useCallback(
        (newValue: (string | number)[]) => {
            assert(
                newValue.every(x => typeof x === 'number'),
                'only numbers'
            );
            const value = newValue as number[];
            dispatch(UiStore.setSearchFields({ categoryIds: value }));
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
    const value = useKresusState(state => UiStore.getSearchFields(state.ui).dateLow);
    const maxDate = useKresusState(
        state => UiStore.getSearchFields(state.ui).dateHigh || undefined
    );
    const dispatch = useKresusDispatch();
    const onSelect = useCallback(
        (rawDateLow: Date | null) => {
            let dateLow = null;
            if (rawDateLow) {
                dateLow = startOfDay(new Date(rawDateLow));
            }

            dispatch(UiStore.setSearchFields({ dateLow }));
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
    const value = useKresusState(state => UiStore.getSearchFields(state.ui).dateHigh);
    const minDate = useKresusState(state => UiStore.getSearchFields(state.ui).dateLow || undefined);
    const dispatch = useKresusDispatch();
    const onSelect = useCallback(
        (rawDateHigh: Date | null) => {
            let dateHigh = null;
            if (rawDateHigh) {
                dateHigh = endOfDay(new Date(rawDateHigh));
            }
            dispatch(UiStore.setSearchFields({ dateHigh }));
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
    const displaySearchDetails = useKresusState(state => UiStore.getDisplaySearchDetails(state.ui));
    const searchFields = useKresusState(state => UiStore.getSearchFields(state.ui));

    const dispatch = useKresusDispatch();

    const setKeywords = useCallback(
        (keywordsString: string) => {
            const trimmed = keywordsString.trim();
            let keywords: string[];
            if (trimmed.length) {
                keywords = trimmed.split(' ').map((w: string) => w.toLowerCase());
            } else {
                keywords = [];
            }
            dispatch(UiStore.setSearchFields({ keywords }));
        },
        [dispatch]
    );

    const setAmountLowHigh = useCallback(
        (low: number | null, high: number | null) => {
            dispatch(
                UiStore.setSearchFields({
                    amountLow: low,
                    amountHigh: high,
                })
            );
        },
        [dispatch]
    );

    const resetAll = useCallback(
        (showDetails: boolean) => {
            dispatch(UiStore.resetSearch());
            dispatch(UiStore.toggleSearchDetails(showDetails));
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
