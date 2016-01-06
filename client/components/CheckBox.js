import { has } from '../helpers';

export default class CheckBox extends React.Component {
    constructor(props) {
        has(props, 'label');
        has(props, 'checked');
        has(props, 'onChange');
        super(props);
        this.handleOnChange = this.props.onChange.bind(this);
    }

    render() {
        return (
            <div className="checkbox">
                <label className="label-control">
                    <input type="checkbox" id={ this.props.label }
                      onChange={ this.handleOnChange }
                      defaultChecked={ this.props.checked }
                    />
                    { this.props.label }
                </label>
            </div>
        );
    }
}
