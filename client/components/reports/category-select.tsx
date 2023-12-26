import React, { useCallback } from 'react';
import { Dispatch } from 'redux';
import { useDispatch } from 'react-redux';
import { createSelector } from 'reselect';

import {
    NONE_CATEGORY_ID,
    translate as $t,
    generateColor,
    notify,
    useKresusState,
    assert,
} from '../../helpers';
import { GlobalState } from '../../store';
import * as CategoriesStore from '../../store/categories';

import FuzzyOrNativeSelect from '../ui/fuzzy-or-native-select';

export function formatCreateCategoryLabel(label: string): string {
    return $t('client.general.create_select_option', {
        type: $t('client.transactions.category_denomination'),
        label,
    });
}

const optionsSelector = createSelector(
    (state: GlobalState) => CategoriesStore.all(state.categories),
    cats => {
        // Put "No category" on top of the list.
        const noneCategory = cats.find(cat => cat.id === NONE_CATEGORY_ID);
        assert(typeof noneCategory !== 'undefined', 'none category exists');
        return [
            {
                value: noneCategory.id,
                label: noneCategory.label,
            },
        ].concat(
            cats
                .filter(cat => cat.id !== NONE_CATEGORY_ID)
                .map(cat => ({ value: cat.id, label: cat.label }))
        );
    }
);

interface Props {
    // Id for the select element.
    id?: string;

    // The selected category id.
    value?: number;

    // A callback to be called when the select value changes.
    onChange: (value: number | null) => void;

    // A CSS class to apply to the select.
    className?: string;
}

export const useOnCreateCategory = (
    dispatch: Dispatch<any>,
    propsOnChange: (value: number | null) => void
) => {
    const onCreate = useCallback(
        async (label: string) => {
            try {
                const category = await dispatch(
                    CategoriesStore.create({
                        label,
                        color: generateColor(),
                    })
                ).unwrap();

                propsOnChange(category.id);
            } catch (err) {
                notify.error($t('client.category.creation_error', { error: err.toString() }));
            }
        },
        [dispatch, propsOnChange]
    );
    return onCreate;
};

const CategorySelector = (props: Props) => {
    let className = 'form-element-block';
    if (props.className) {
        className += ` ${props.className}`;
    }

    const options = useKresusState(state => optionsSelector(state));

    const dispatch = useDispatch();

    const propsOnChange = props.onChange;

    const onChange = useCallback(
        (value: string | null) => {
            if (value === null) {
                propsOnChange(null);
                return;
            }
            const categoryId = parseInt(value, 10);
            if (isNaN(categoryId)) {
                return;
            }
            propsOnChange(categoryId);
        },
        [propsOnChange]
    );

    const onCreate = useOnCreateCategory(dispatch, propsOnChange);

    return (
        <FuzzyOrNativeSelect
            id={props.id}
            value={props.value}
            className={className}
            clearable={false}
            formatCreateLabel={formatCreateCategoryLabel}
            options={options}
            onChange={onChange}
            onCreate={onCreate}
        />
    );
};

CategorySelector.displayName = 'CategorySelect';

export default CategorySelector;
