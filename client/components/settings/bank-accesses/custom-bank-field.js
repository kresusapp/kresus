import React from 'react';

import { translate as $t } from '../../../helpers';

import PasswordInput from '../../ui/password-input';

class CustomBankField extends React.Component {

    constructor(props) {
        super(props);

        this.fieldInput = null;
    }

    getValue() {
        let node = this.fieldInput;
        let value;

        if (this.props.params.type === 'password') {
            value = node.getValue();
        } else if (this.props.params.type === 'number') {
            value = parseInt(node.value, 10);
        } else {
            value = node.value;
        }
        return {
            name: this.props.params.name,
            value
        };
    }

    render() {
        let customFieldFormInput, customFieldOptions, defaultValue;
        let fieldInputCb = input => {
            this.fieldInput = input;
        };

        switch (this.props.params.type) {
            case 'select':
                customFieldOptions = this.props.params.values.map(opt =>
                    <option
                      key={ opt.value }
                      value={ opt.value }>
                        { opt.label }
                    </option>
                );
                defaultValue = this.props.params.currentValue || this.props.params.default;
                customFieldFormInput = (
                    <select
                      className="form-control"
                      id={ this.props.params.name }
                      ref={ fieldInputCb }
                      defaultValue={ defaultValue }>
                        { customFieldOptions }
                    </select>
                );
                break;

            case 'text':
            case 'number':
                customFieldFormInput = (
                    <input
                      type={ this.props.params.type }
                      className="form-control"
                      id={ this.props.params.name }
                      ref={ fieldInputCb }
                      placeholder={ this.props.params.placeholderKey ?
                                      $t(this.props.params.placeholderKey) :
                                      '' }
                      value={ this.props.params.currentValue }
                    />
                );
                break;

            case 'password':
                customFieldFormInput = (
                    <PasswordInput
                      id={ this.props.params.name }
                      ref={ fieldInputCb }
                      placeholder={ this.props.params.placeholderKey ?
                                      $t(this.props.params.placeholderKey) :
                                      '' }
                    />
                );
                break;

            default:
                alert($t('client.settings.unknown_field_type'));
        }

        return (
            <div className="form-group">
                <label htmlFor={ this.props.params.name }>
                    { $t(this.props.params.labelKey) }
                </label>
                { customFieldFormInput }
            </div>
        );
    }
}

CustomBankField.propTypes = {
    // An object with parameters according to the type of custom field
    params: React.PropTypes.object.isRequired
};

export default CustomBankField;
