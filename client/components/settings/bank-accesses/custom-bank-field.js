import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get } from '../../../store';

import PasswordInput from '../../ui/password-input';

class CustomBankField extends React.Component {

    constructor(props) {
        super(props);

        this.handleOnChange = this.handleOnChange.bind(this);
    }

    handleOnChange(event) {
        let value;

        // Handle the case where a text/number input is cleared.
        if (event.target) {
            value = event.target.value;

            if (this.props.type === 'number') {
                value = parseInt(value, 10);
            }
        }

        this.props.onChange(this.props.name, value);
    }

    render() {
        let customFieldFormInput, customFieldOptions, defaultValue;

        switch (this.props.type) {
            case 'select':
                customFieldOptions = this.props.values.map(opt => (
                    <option
                      key={ opt.value }
                      value={ opt.value }>
                        { opt.label }
                    </option>
                ));
                defaultValue = this.props.value || this.props.default;
                customFieldFormInput = (
                    <select
                      className="form-control"
                      id={ this.props.name }
                      onChange={ this.handleOnChange }
                      defaultValue={ defaultValue }>
                        { customFieldOptions }
                    </select>
                );
                break;

            case 'text':
            case 'number':
                customFieldFormInput = (
                    <input
                      type={ this.props.type }
                      className="form-control"
                      id={ this.props.name }
                      onChange={ this.handleOnChange }
                      placeholder={ this.props.placeholderKey ?
                                      $t(this.props.placeholderKey) :
                                      '' }
                      value={ this.props.value }
                    />
                );
                break;

            case 'password':
                customFieldFormInput = (
                    <PasswordInput
                      id={ this.props.name }
                      onChange={ this.handleOnChange }
                      placeholder={ this.props.placeholderKey ?
                                      $t(this.props.placeholderKey) :
                                      '' }
                    />
                );
                break;

            default:
                alert($t('client.settings.unknown_field_type'));
        }

        return (
            <div className="form-group">
                <label htmlFor={ this.props.name }>
                    { $t(this.props.labelKey) }
                </label>
                { customFieldFormInput }
            </div>
        );
    }
}

const Export = connect((state, props) => {
    let customFields = get.bankByUuid(state, props.bank).customFields;
    let customField = customFields.find(field => field.name === props.name);
    return {
        type: customField.type,
        values: customField.values || [],
        default: customField.default || '',
        placeholderKey: customField.placeholderKey || '',
        labelKey: customField.labelKey,
    };
})(CustomBankField);

Export.propTypes = {
    // The name of the field.
    name: PropTypes.string.isRequired,

    // The value of the field.
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    // Bank uuid.
    bank: PropTypes.string.isRequired,

    // A function to be called when the user changes the input. The function
    // Has the following signature : function(name, value)
    onChange: PropTypes.func
};

export default Export;
