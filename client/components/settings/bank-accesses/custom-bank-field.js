import React from 'react';

import { translate as $t } from '../../../helpers';

export default class CustomBankField extends React.Component {

    constructor(props) {
        super(props);

        // Initialise select
        let selectedValue;
        if (this.props.params.type === 'select') {
            if (typeof this.props.params.currentValue !== 'undefined') {
                selectedValue = this.props.params.currentValue;
            } else if (typeof this.props.default !== 'undefined') {
                selectedValue = this.props.default;
            } else {
                selectedValue = this.props.params.default;
            }
        }

        this.state = { selectedValue };
        this.refField = this.refField.bind(this);
        this.handleChangeSelect = this.handleChangeSelect.bind(this);
    }

    intialeState

    refField(node) {
        this.field = node;
    }

    getValue() {
        return {
            name: this.props.params.name,
            value: (this.props.params.type === 'number') ?
                parseInt(this.field.value, 10) :
                this.field.value
        };
    }

    handleChangeSelect(e) {
        this.setState({ selectedValue: e.target.value });
    }

    render() {
        let customFieldFormInput, customFieldOptions;

        switch (this.props.params.type) {
            case 'select':
                customFieldOptions = this.props.params.values.map(opt =>
                    <option key={ opt.value } value={ opt.value }>
                        { opt.label }
                    </option>
                );

                customFieldFormInput = (
                    <select name={ this.props.params.name }
                      className="form-control"
                      id={ this.props.params.name }
                      ref={ this.refField }
                      value={ this.state.selectedValue }
                      onChange={ this.handleChangeSelect }>
                        { customFieldOptions }
                    </select>
                );
                break;

            case 'text':
            case 'number':
            case 'password':
                customFieldFormInput = (
                    <input name={ this.props.params.name }
                      type={ this.props.params.type }
                      className="form-control"
                      id={ this.props.params.name }
                      ref={ this.refField }
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
    // Parameters for the custom field
    params: React.PropTypes.object.isRequired,

    // Maybe a default value if the field is a select
    default: React.PropTypes.string
};
