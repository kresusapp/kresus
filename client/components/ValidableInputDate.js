import {has} from '../helpers';

import DatePicker from './DatePicker';

export default class ValidableInputDate extends React.Component {
    constructor(props) {
        has(props, 'returnInputValue');
        has(props, 'inputID');
        has(props, 'label');
        super(props);
        this.state = {isOK: false};
    }

    clear() {
        this.refs.inputdate.clear();
        this.onSelect('');
    }

    showValidity() {
        if (this.state.isOK) {
            return <span className="fa fa-check form-control-feedback" aria-hidden="true"></span>
        }
        return <span className="fa fa-times form-control-feedback" aria-hidden="true"></span>
    }

    onSelect(date) {
        if (date) {
            this.setState({isOK: true}, this.props.returnInputValue(date));
        } else {
            this.setState({isOK: false}, this.props.returnInputValue(null));
        }
    }

    render() {
        return (
            <div className="form-group has-feedback">
                <label className="control-label" htmlFor={this.props.inputID} >
                    {this.props.label}
                </label>
                <DatePicker id={this.props.inputID} required
                  onSelect={this.onSelect.bind(this)}
                  ref="inputdate"
                />
                {this.showValidity()}
            </div>
        );
    }
}
