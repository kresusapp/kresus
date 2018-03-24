import React from 'react';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';

import Select from 'react-select';

import { translate as $t } from '../../helpers';
import { get } from '../../store';

class TypeSelect extends React.Component {
    handleChange = selectedValue => {
        if (selectedValue.value && selectedValue.value !== this.props.selectedValue) {
            this.props.onChange(selectedValue.value);
        }
    };

    render() {
        return (
            <Select
                value={this.props.selectedValue}
                id={this.props.id}
                clearable={false}
                onChange={this.handleChange}
                options={this.props.types}
            />
        );
    }
}

const options = createSelector(
    state => get.types(state),
    types => {
        return types.map(type => ({
            value: type.name,
            label: $t(`client.${type.name}`)
        }));
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
