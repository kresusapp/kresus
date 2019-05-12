import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import PropTypes from 'prop-types';

import { NONE_CATEGORY_ID, translate as $t, generateColor, notify } from '../../helpers';
import { get, actions } from '../../store';

import FuzzyOrNativeSelect from '../ui/fuzzy-or-native-select';

function formatCreateLabel(label) {
    return $t('client.operations.create_category', { label });
}

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

const CategorySelector = connect(
    (state, props) => {
        let className = 'form-element-block';
        if (props.className) {
            className += ` ${props.className}`;
        }
        return {
            options: optionsSelector(state),
            className,
            clearable: false,
            creatable: true,
            formatCreateLabel
        };
    },
    (dispatch, props) => {
        return {
            async onCreate(label) {
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
)(FuzzyOrNativeSelect);

CategorySelector.propTypes = {
    // Id for the select element.
    id: PropTypes.string,

    // The selected category id.
    value: PropTypes.string,

    // A callback to be called when the select value changes.
    onChange: PropTypes.func.isRequired,

    // A CSS class to apply to the select.
    className: PropTypes.string
};

CategorySelector.displayName = 'CategorySelect';

export default CategorySelector;
