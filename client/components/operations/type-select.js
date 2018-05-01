import React from 'react';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';

import { translate as $t } from '../../helpers';
import { get } from '../../store';

class TypeSelect extends React.Component {
    handleChange = event => this.props.onChange(event.target.value);

    render() {
        return (
            <select
                className="form-element-block btn-transparent"
                value={this.props.selectedValue}
                id={this.props.id}
                onChange={this.handleChange}>
                {this.props.types}
            </select>
        );
    }
}

const options = createSelector(
    state => get.types(state),
    types => {
        return types.map(type => (
            <option key={`operation-type-select-operation-${type.id}`} value={type.name}>
                {$t(`client.${type.name}`)}
            </option>
        ));
    }
);

const Export = connect(state => {
    return {
        types: options(state)
    };
})(TypeSelect);

Export.propTypes = {
    // ID for the select element
    id: PropTypes.string,

    // The selected type id.
    selectedValue: PropTypes.string.isRequired,

    // A callback to be called when the select value changes.
    onChange: PropTypes.func.isRequired
};

export default Export;
