import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get } from '../../../store';

import PasswordInput from '../../ui/password-input';

const CustomBankField = props => {
    const handleChange = event => {

        let value;

        // Handle the case where a text/number input is cleared.
        if (event.target) {
            value = event.target.value;

            if (props.type === 'number') {
                value = parseInt(value, 10);
            }
        }

        // PasswordInput returns directly the value in the onChange callback.
        if (props.type === 'password')
            value = event;

        props.onChange(props.name, value);
    };

    let customFieldFormInput, customFieldOptions, defaultValue;

    switch (props.type) {
        case 'select':
            customFieldOptions = props.values.map(opt => (
                <option
                  key={ opt.value }
                  value={ opt.value }>
                    { opt.label }
                </option>
            ));
            defaultValue = props.value || props.default;

            customFieldFormInput = (
                <select
                  className="form-control"
                  id={ props.name }
                  onChange={ handleChange }
                  defaultValue={ defaultValue }>
                    { customFieldOptions }
                </select>
            );
            break;

        case 'text':
        case 'number':
            customFieldFormInput = (
                <input
                  type={ props.type }
                  className="form-control"
                  id={ props.name }
                  onChange={ handleChange }
                  placeholder={ props.placeholderKey ?
                                  $t(props.placeholderKey) :
                                  '' }
                  value={ props.value }
                />
            );
            break;

        case 'password':
            customFieldFormInput = (
                <PasswordInput
                  id={ props.name }
                  onChange={ handleChange }
                  defaultValue={ props.value }
                  placeholder={ props.placeholderKey ?
                                  $t(props.placeholderKey) :
                                  '' }
                />
            );
            break;

        default:
            alert($t('client.settings.unknown_field_type'));
    }

    return (
        <div className="form-group">
            <label htmlFor={ props.name }>
                { $t(props.labelKey) }
            </label>
            { customFieldFormInput }
        </div>
    );
};

const Export = connect((state, props) => {
    let customFields = get.bankByUuid(state, props.bank).customFields;
    let customField = customFields.find(field => field.name === props.name);
    return {
        type: customField.type,
        values: customField.values || [],
        default: customField.default || '',
        placeholderKey: customField.placeholderKey || '',
        labelKey: customField.labelKey
    };
})(CustomBankField);

Export.propTypes = {
    // The name of the field.
    name: PropTypes.string.isRequired,

    // The value of the field.
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    // Bank uuid for which the custom field is set.
    bank: PropTypes.string.isRequired,

    // A function to be called when the user changes the input. The function
    // has the following signature: function(name, value)
    onChange: PropTypes.func
};

export default Export;
