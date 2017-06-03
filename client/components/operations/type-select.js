import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { get } from '../../store';

import ButtonSelect from '../ui/button-select';

const TypeSelect = props => {
    return (
        <ButtonSelect
          optionsArray={ props.typesId }
          selectedId={ props.selectedTypeId }
          mapIdToDescriptor={ props.mapIdToDescriptor }
          onSelectId={ props.onSelectId }
        />
    );
};

TypeSelect.propTypes = {
    // The selected type id
    selectedTypeId: PropTypes.string.isRequired,

    // A function to call whenever the type has been changed.
    onSelectId: PropTypes.func.isRequired
};

export default connect(state => {
    return {
        typesId: get.typesIds(state),
        mapIdToDescriptor: get.typeMapAllIdToDescriptor(state)
    };
})(TypeSelect);
