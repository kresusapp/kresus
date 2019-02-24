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

const TypeSelect = connect(state => {
    return {
        clearable: false,
        className: 'form-element-block',
        noOptionsMessage: () => $t('client.operations.no_type_found'),
        options: optionsSelector(state)
    };
})(FuzzyOrNativeSelect);

TypeSelect.propTypes = {
    // ID for the select element
    id: PropTypes.string,

    // The selected type id.
    value: PropTypes.string.isRequired,

    // A callback to be called when the select value changes.
    onChange: PropTypes.func.isRequired
};

export default TypeSelect;
