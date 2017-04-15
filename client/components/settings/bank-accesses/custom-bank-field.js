import React from 'react';

import { translate as $t } from '../../../helpers';

class CustomBankField extends React.Component {

    constructor(props) {
        super(props);

        this.fieldInput = null;
    }

    getValue() {
        let node = this.fieldInput;
        return {
            name: this.props.params.name,
            value: (this.props.params.type === 'number') ?
                parseInt(node.value, 10) :
                node.value
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
                      name={ this.props.params.name }
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
            case 'password':
                customFieldFormInput = (
                    <input
                      name={ this.props.params.name }
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
