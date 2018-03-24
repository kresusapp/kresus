import React from 'react';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';

import Select from 'react-select';

import { NONE_CATEGORY_ID } from '../../helpers';
import { get } from '../../store';

class CategorySelect extends React.Component {
    handleChange = selectedValue => {
        let value = NONE_CATEGORY_ID;
        if (selectedValue) {
            value = selectedValue.value;
        }
        return this.props.onChange(value);
    };

    render() {
        const style = this.props.borderColor
            ? { borderRight: `5px solid ${this.props.borderColor}` }
            : null;

        return (
            <Select
                value={this.props.selectedValue}
                style={style}
                id={this.props.id}
                onChange={this.handleChange}
                options={this.props.categories}
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
        categories: options(state),
        borderColor
    };
})(CategorySelect);

Export.propTypes = {
    // ID for the select element
    id: PropTypes.string,

    // The selected category id.
    selectedValue: PropTypes.string.isRequired,

    // A callback to be called when the select value changes.
    onChange: PropTypes.func.isRequired
};

export default Export;
