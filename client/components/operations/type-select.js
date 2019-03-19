import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';

import FuzzyOrNativeSelect from '../ui/fuzzy-or-native-select';

import { translate as $t } from '../../helpers';
import { get } from '../../store';

const optionsSelector = createSelector(
    state => get.types(state),
    types => {
        return types.map(type => ({
            value: type.name,
            label: $t(`client.${type.name}`)
        }));
    }
);

function noTypeFound() {
    return $t('client.operations.no_type_found');
}

const TypeSelect = connect((state, props) => {
    let className = 'form-element-block';
    if (props.className) {
        className += ` ${props.className}`;
    }

    return {
        clearable: false,
        className,
        noOptionsMessage: noTypeFound,
        options: optionsSelector(state)
    };
})(FuzzyOrNativeSelect);

TypeSelect.propTypes = {
    // ID for the select element
    id: PropTypes.string,

    // The selected type id.
    value: PropTypes.string.isRequired,

    // A callback to be called when the select value changes.
    onChange: PropTypes.func.isRequired,

    // A CSS class to apply to the select.
    className: PropTypes.string
};

export default TypeSelect;
