import React from 'react';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';

import { NONE_CATEGORY_ID } from '../../helpers';
import { actions, get } from '../../store';

const CategorySelect = props => {
    let style = props.borderColor ? { borderRight: `5px solid ${props.borderColor}` } : null;
    const onChange = event => props.onChange(event.target.value);
    return (
        <select
            className="form-control btn-transparent"
            value={props.selectedValue}
            style={style}
            onChange={onChange}>
            {props.categories}
        </select>
    );
};

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

const Export = connect(
    (state, props) => {
        let borderColor =
            props.selectedValue === NONE_CATEGORY_ID
                ? null
                : get.categoryById(state, props.selectedValue).color;
        return {
            categories: options(state),
            borderColor
        };
    },
    (dispatch, props) => {
        let onChange = props.onChange
            ? props.onChange
            : value => {
                  actions.setOperationCategory(
                      dispatch,
                      props.operationId,
                      value,
                      props.selectedValue
                  );
              };
        return {
            onChange
        };
    }
)(CategorySelect);

Export.propTypes = {
    // The operation unique identifier for which the category has to be selected.
    operationId: PropTypes.string.isRequired,

    // The selected category.
    selectedValue: PropTypes.string.isRequired,

    // An optional callback to be called when the select valu chances to override
    // the one added in connect
    onChange: PropTypes.func
};

export default Export;
