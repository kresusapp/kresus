import React from 'react';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';

import { NONE_CATEGORY_ID } from '../../helpers';
import { get } from '../../store';

class CategorySelect extends React.Component {
    handleChange = event => this.props.onChange(event.target.value);

    render() {
        let style = this.props.borderColor
            ? { borderRight: `5px solid ${this.props.borderColor}` }
            : null;
        return (
            <select
                className="form-element-block"
                value={this.props.selectedValue}
                style={style}
                id={this.props.id}
                onChange={this.handleChange}>
                {this.props.categories}
            </select>
        );
    }
}

function categoryToOption(cat) {
    return (
        <option key={cat.id} value={cat.id}>
            {cat.title}
        </option>
    );
}

const options = createSelector(
    state => get.categories(state),
    cats => {
        // Put "No category" on top of the list.
        let ops = [categoryToOption(cats.find(cat => cat.id === NONE_CATEGORY_ID))];
        return ops.concat(
            cats.filter(cat => cat.id !== NONE_CATEGORY_ID).map(cat => categoryToOption(cat))
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
