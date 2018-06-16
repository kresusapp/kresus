import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';

import FuzzyOrNativeSelect from '../ui/fuzzy-or-native-select';

import { translate as $t } from '../../helpers';
import { get } from '../../store';

const options = createSelector(
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
        options: options(state),
        clearable: false,
        noResultsText: $t('client.operations.no_type_found'),
        matchProp: 'label',
        className: 'form-element-block'
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
