import { has } from '../../helpers';

export default class SelectWithDefault extends React.Component {

    constructor(props, options) {
        has(props, 'defaultValue');
        has(props, 'onChange');
        has(props, 'htmlId');
        super(props);
        this.options = options;
    }

    getValue() {
        return this.refs.selector.getDOMNode().value;
    }

    render() {
        return (
            <select className="form-control"
              defaultValue={ this.props.defaultValue }
              onChange={ this.props.onChange }
              ref="selector" id={ this.props.htmlId }>
                { this.options }
            </select>
        );
    }
}
