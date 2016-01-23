import {has} from '../../helpers';

export default class ValidableInputNumber extends React.Component {
    constructor(props) {
        has(props, 'returnInputValue');
        has(props, 'inputID');
        has(props, 'step');
        has(props, 'label');
        super(props);
        this.state = {isOK: false};
    }

    clear() {
        this.refs.number.getDOMNode().value='';
        this.onChange();
    }

    onChange() {
        let number = Number.parseFloat(this.refs.number.getDOMNode().value.trim());
        if (!Number.isNaN(number) && Number.isFinite(number) && 1/number !== -Infinity) {
            this.setState({isOK: true}, this.props.returnInputValue(number));
        } else {
            this.setState({isOK: false}, this.props.returnInputValue(null));
        }
    }

    showValidity() {
        if (this.state.isOK) {
            return <span className="fa fa-check form-control-feedback" aria-hidden="true"></span>
        }
        return <span className="fa fa-times form-control-feedback" aria-hidden="true"></span>
    }

    render() {
        return (
            <div className="form-group has-feedback">
                <label className="control-label" htmlFor={this.props.inputID} >
                    {this.props.label}
                </label>
                <input className="form-control" type="number" id={this.props.inputID}
                  step={this.props.step} ref="number" onChange={this.onChange.bind(this)}
                required />
                {this.showValidity()}
            </div>
        );
    }
}
