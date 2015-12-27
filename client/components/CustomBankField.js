import {has, translate as t} from '../Helpers';
import T from './Translated';

export default class CustomBankField extends React.Component {

    constructor(props) {
        has(props, 'params');

        super(props);
    }

    getValue() {
        let node = this.refs.field.getDOMNode();
        return {
            name: this.props.params.name,
            value: (this.props.params.type === "number") ? parseInt(node.value, 10) : node.value
        };
    }

    render() {
        let customFieldFormInput;

        switch (this.props.params.type) {
            case "select":
                let customFieldOptions = this.props.params.values.map(opt =>
                    <option key={opt.value} value={opt.value} selected={opt.value === this.props.params.currentValue}>{opt.label}</option>
                );
                customFieldFormInput = <select name={this.props.params.name} className="form-control" id={this.props.params.name} ref="field">
                    {customFieldOptions}
                </select>;
                break;

            case "text":
            case "number":
            case "password":
                customFieldFormInput = <input name={this.props.params.name}
                                        type={this.props.params.type}
                                        className="form-control"
                                        id={this.props.params.name}
                                        ref="field"
                                        placeholder={t('client.' + this.props.params.placeholderKey) || this.props.params.placeholder}
                                        value={this.props.params.currentValue}
                                    />;
                break;

            default:
                alert(t('client.settings.unknown_field_type') || 'unknown field type');
        }

        return <div className="form-group">
            <label htmlFor={this.props.params.name}>
              <T k={'client.' + this.props.params.labelKey}>
                {this.props.params.label}
              </T>
            </label>
            {customFieldFormInput}
        </div>;
    }
}
