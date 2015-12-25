import {has} from '../Helpers';

export default class ValidableInputText extends React.Component {
    constructor(props) {
        has(props, 'returnInputValue');
        has(props, 'inputID');
        has(props, 'label');
        super(props);
        this.state = {isOK: false};
    }

    onChange() {
        let title = this.refs.text.getDOMNode().value.trim();
        if (title.length > 0) {
            this.setState({isOK: true}, this.props.returnInputValue(title));
        } else {
            this.setState({isOK: false}, this.props.returnInputValue(null));
        }
    }

    clear() {
        this.refs.text.getDOMNode().value='';
        this.onChange();
    }

    showValidity() {
        if (this.state.isOK) {
            return <span className="fa fa-check form-control-feedback" aria-hidden="true"></span>;
        }
        return <span className="fa fa-times form-control-feedback" aria-hidden="true"></span>;
    }

    render() {
        return (
            <div className="form-group has-feedback">
                <label className="control-label" htmlFor={this.props.inputID} >
                    {this.props.label}
                </label>
                <input className="form-control" type='text' id={this.props.inputID}
                ref="text" required onChange={this.onChange.bind(this)} />
                {this.showValidity()}
            </div>
        );
    }
}
