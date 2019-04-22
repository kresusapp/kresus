import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import PropTypes from 'prop-types';

import { NONE_CATEGORY_ID, translate as $t, generateColor, notify } from '../../helpers';
import { get, actions } from '../../store';

import FuzzyOrNativeSelect from '../ui/fuzzy-or-native-select';

function formatCreateLabel(label) {
    return $t('client.operations.create_category', { label });
}

let CategorySelect = props => {
    let className = 'form-element-block';
    if (props.className) {
        className += ` ${props.className}`;
    }

    return (
        <FuzzyOrNativeSelect
            className={className}
            clearable={false}
            creatable={true}
            formatCreateLabel={formatCreateLabel}
            id={props.id}
            onChange={props.onChange}
            onCreate={props.onCreateCategory}
            options={props.options}
            value={props.value}
        />
    );
};

const optionsSelector = createSelector(
    state => get.categories(state),
    cats => {
        // Put "No category" on top of the list.
        let noneCategory = cats.find(cat => cat.id === NONE_CATEGORY_ID);
        return [
            {
                value: noneCategory.id,
                label: noneCategory.label
            }
        ].concat(
            cats
                .filter(cat => cat.id !== NONE_CATEGORY_ID)
                .map(cat => ({ value: cat.id, label: cat.label }))
        );
    }
);

const Export = connect(
    state => {
        return {
            options: optionsSelector(state)
        };
    },
    (dispatch, props) => {
        return {
            async onCreateCategory(label) {
                try {
                    let category = await actions.createCategory(dispatch, {
                        label,
                        color: generateColor()
                    });
                    props.onChange(category.id);
                } catch (err) {
                    notify.error($t('client.category.creation_error', { error: err.toString() }));
                }
            }
        };
    }
)(CategorySelect);

Export.propTypes = {
    // Id for the select element.
    id: PropTypes.string,

    // The selected category id.
    value: PropTypes.string,

    // A callback to be called when the select value changes.
    onChange: PropTypes.func.isRequired,

    // A CSS class to apply to the select.
    className: PropTypes.string
};

export default Export;
