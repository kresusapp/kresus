import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t, notify } from '../../../helpers';
import { get } from '../../../store';

import PasswordInput from '../../ui/password-input';
import ValidatedTextInput from '../../ui/validated-text-input';
import FuzzyOrNativeSelect from '../../ui/fuzzy-or-native-select';

class CustomBankField extends React.Component {
    handleChange = event => {
        let value = event;
        if (event === null && this.props.type === 'select') {
            // Handle selects.
            value = this.props.default ? this.props.default : this.props.values[0].value;
        } else if (event !== null && event.target) {
            // Handle the case where a text/number input is cleared.
            value = event.target.value;
            if (this.props.type === 'number') {
                value = parseInt(value, 10);
            }
        }
        this.props.onChange(this.props.name, value);
    };

    render() {
        let customFieldFormInput, defaultValue;

        switch (this.props.type) {
            case 'select':
                defaultValue = this.props.value || this.props.default;
                customFieldFormInput = (
                    <FuzzyOrNativeSelect
                        className="form-element-block check-validity"
                        id={this.props.name}
                        noResultsText={$t(`client.accountwizard.no_${this.props.name}_found`)}
                        onChange={this.handleChange}
                        options={this.props.values}
                        placeholder={$t('client.general.select')}
                        required={true}
                        value={defaultValue}
                    />
                );
                break;

            case 'text':
                customFieldFormInput = (
                    <ValidatedTextInput
                        id={this.props.name}
                        onChange={this.handleChange}
                        placeholder={this.props.placeholderKey ? $t(this.props.placeholderKey) : ''}
                        value={this.props.value}
                    />
                );
                break;

            case 'number':
                customFieldFormInput = (
                    <input
                        type="number"
                        className="form-element-block check-validity"
                        id={this.props.name}
                        onChange={this.handleChange}
                        placeholder={this.props.placeholderKey ? $t(this.props.placeholderKey) : ''}
                        value={this.props.value}
                        required={true}
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
                notify.error($t('client.settings.unknown_field_type'));
        }

        // The "cols-with-label" css class is active only within modals.
        return (
            <div className="cols-with-label">
                <label htmlFor={this.props.name}>{$t(this.props.labelKey)}</label>
                {customFieldFormInput}
            </div>
        );
    }
}

const Export = connect((state, props) => {
    let staticCustomFields = get.bankByUuid(state, props.vendorId).customFields;
    let customFieldDesc = staticCustomFields.find(field => field.name === props.name);
    return {
        type: customFieldDesc.type,
        values: customFieldDesc.values || [],
        default: customFieldDesc.default || '',
        placeholderKey: customFieldDesc.placeholderKey || '',
        labelKey: `client.settings.${props.name}` || ''
    };
})(CustomBankField);

Export.propTypes /* remove-proptypes */ = {
    // The name of the field.
    name: PropTypes.string.isRequired,

    // The value of the field.
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    // Bank uuid for which the custom field is set.
    vendorId: PropTypes.string.isRequired,

    // A function to be called when the user changes the input. The function
    // has the following signature: function(name, value)
    onChange: PropTypes.func
};

export default Export;
