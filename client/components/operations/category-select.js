import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import PropTypes from 'prop-types';

import { NONE_CATEGORY_ID, translate as $t } from '../../helpers';
import { get, actions } from '../../store';

import { generateColor } from '../ui/color-picker';
import FuzzyOrNativeSelect from '../ui/fuzzy-or-native-select';

class CategorySelect extends React.Component {
    formatCreateLabel = label => {
        return $t('client.operations.create_category', { label });
    };

    render() {
        const style = this.props.borderColor
            ? { borderRight: `5px solid ${this.props.borderColor}` }
            : null;

        return (
            <FuzzyOrNativeSelect
                className="form-element-block"
                clearable={false}
                creatable={true}
                formatCreateLabel={this.formatCreateLabel}
                id={this.props.id}
                onChange={this.props.onChange}
                onCreate={this.props.onCreateCategory}
                options={this.props.options}
                style={style}
                value={this.props.value}
            />
        );
    }
}

const optionsSelector = createSelector(
    state => get.categories(state),
    cats => {
        // Put "No category" on top of the list.
        let noneCategory = cats.find(cat => cat.id === NONE_CATEGORY_ID);
        return [
            {
                value: noneCategory.id,
                label: noneCategory.title
            }
        ].concat(
            cats
                .filter(cat => cat.id !== NONE_CATEGORY_ID)
                .map(cat => ({ value: cat.id, label: cat.title }))
        );
    }
);

const Export = connect(
    (state, props) => {
        let borderColor =
            props.value === NONE_CATEGORY_ID ? null : get.categoryById(state, props.value).color;
        return {
            options: optionsSelector(state),
            borderColor
        };
    },
    (dispatch, props) => {
        return {
            async onCreateCategory(label) {
                try {
                    let category = await actions.createCategory(dispatch, {
                        title: label,
                        color: generateColor()
                    });
                    props.onChange(category.id);
                } catch (err) {
                    alert(`Error when creating a category: ${err.toString()}`);
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
    onChange: PropTypes.func.isRequired
};

export default Export;
