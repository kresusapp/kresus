import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get } from '../../../store';

import PasswordInput from '../../ui/password-input';

class CustomBankField extends React.Component {
    handleChange = event => {
        let value;
        // Handle the case where a text/number input is cleared.
        if (event.target) {
            value = event.target.value;
            if (this.props.type === 'number') {
                value = parseInt(value, 10);
            }
        }
        this.props.onChange(this.props.name, value);
    };

    render() {
        let customFieldFormInput, customFieldOptions, defaultValue;

        switch (this.props.type) {
            case 'select':
                customFieldOptions = this.props.values.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ));
                defaultValue = this.props.value || this.props.default;

                customFieldFormInput = (
                    <select
                        className="form-element-block"
                        id={this.props.name}
                        onChange={this.handleChange}
                        defaultValue={defaultValue}>
                        {customFieldOptions}
                    </select>
                );
                break;

            case 'text':
            case 'number':
                customFieldFormInput = (
                    <input
                        type={this.props.type}
                        className="form-element-block"
                        id={this.props.name}
                        onChange={this.handleChange}
                        placeholder={this.props.placeholderKey ? $t(this.props.placeholderKey) : ''}
                        value={this.props.value}
                    />
                );
                break;

            case 'password':
                customFieldFormInput = (
                    <PasswordInput
                        id={this.props.name}
                        onChange={this.handleChange}
                        defaultValue={this.props.value}
                        placeholder={this.props.placeholderKey ? $t(this.props.placeholderKey) : ''}
                        className="block"
                    />
                );
                break;

            default:
                alert($t('client.settings.unknown_field_type'));
        }

        return (
            <div className="form-group">
                <label htmlFor={this.props.name}>{$t(this.props.labelKey)}</label>
                {customFieldFormInput}
            </div>
        );
    }
}

const Export = connect((state, props) => {
    let staticCustomFields = get.bankByUuid(state, props.bank).customFields;
    let customFieldDesc = staticCustomFields.find(field => field.name === props.name);
    return {
        type: customFieldDesc.type,
        values: customFieldDesc.values || [],
        default: customFieldDesc.default || '',
        placeholderKey: customFieldDesc.placeholderKey || '',
        labelKey: customFieldDesc.labelKey
    };
})(CustomBankField);

Export.propTypes /* remove-proptypes */ = {
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
