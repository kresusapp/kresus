import React from 'react';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';

import { Creatable } from 'react-select';

import { NONE_CATEGORY_ID, translate as $t } from '../../helpers';
import { get } from '../../store';

class CategorySelect extends React.Component {
    handleChange = selectedValue => {
        let value = NONE_CATEGORY_ID;
        if (selectedValue) {
            value = selectedValue.value;
        }
        if (value !== this.props.selectedValue) {
            return this.props.onChange(value);
        }
    };

    promptTextCreator = label => {
        return $t('client.operations.create_category', { label });
    };

    isOptionUnique = ({ option: newValue, options: existingValues }) => {
        return existingValues.every(
            cat => cat.label.toLowerCase() !== newValue.label.toLowerCase()
        );
    };

    render() {
        const style = this.props.borderColor
            ? { borderRight: `5px solid ${this.props.borderColor}` }
            : null;

        return (
            <Creatable
                value={this.props.selectedValue}
                style={style}
                clearable={false}
                id={this.props.id}
                onChange={this.handleChange}
                options={this.props.options}
                matchProp="label"
                noResultsText={$t('client.operations.no_category_found')}
                promptTextCreator={this.promptTextCreator}
                onNewOptionClick={this.props.onCreateCategory}
                isOptionUnique={this.isOptionUnique}
            />
        );
    }
}

const options = createSelector(
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

const Export = connect((state, props) => {
    let borderColor =
        props.selectedValue === NONE_CATEGORY_ID
            ? null
            : get.categoryById(state, props.selectedValue).color;
    return {
        options: options(state),
        borderColor
    };
})(CategorySelect);

Export.propTypes = {
    // ID for the select element
    id: PropTypes.string,

    // The selected category id.
    selectedValue: PropTypes.string.isRequired,

    // A callback to be called when the select value changes.
    onChange: PropTypes.func.isRequired,

    // A callback to be called when the user creates a category.
    onCreateCategory: PropTypes.func
};

export default Export;
