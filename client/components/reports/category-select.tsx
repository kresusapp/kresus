import React, { useCallback } from 'react';
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
import { get, actions, GlobalState } from '../../store';

import FuzzyOrNativeSelect from '../ui/fuzzy-or-native-select';

function formatCreateLabel(label: string): string {
    return $t('client.operations.create_category', { label });
}

const optionsSelector = createSelector(
    (state: GlobalState) => get.categories(state),
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

    const onCreate = useCallback(
        async (label: string) => {
            try {
                const category = await actions.createCategory(dispatch, {
                    label,
                    color: generateColor(),
                });
                propsOnChange(category.id);
            } catch (err) {
                notify.error($t('client.category.creation_error', { error: err.toString() }));
            }
        },
        [dispatch, propsOnChange]
    );

    return (
        <FuzzyOrNativeSelect
            id={props.id}
            value={props.value}
            className={className}
            clearable={false}
            creatable={true}
            formatCreateLabel={formatCreateLabel}
            options={options}
            onChange={onChange}
            onCreate={onCreate}
        />
    );
};

CategorySelector.displayName = 'CategorySelect';

export default CategorySelector;
