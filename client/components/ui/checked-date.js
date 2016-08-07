import React from 'react';

import { assertHas } from '../../helpers';

import DatePicker from './date-picker';

export default class ValidableInputDate extends React.Component {
    constructor(props) {
        assertHas(props, 'returnInputValue');
        assertHas(props, 'inputID');
        assertHas(props, 'label');
        super(props);
        this.state = { valid: false };
        this.handleSelect = this.handleSelect.bind(this);
    }

    clear() {
        this.refs.inputdate.clear();
        this.handleSelect('');
    }

    showValidity() {
        if (this.state.valid) {
            return <span className="fa fa-check form-control-feedback" aria-hidden="true"></span>;
        }
        return <span className="fa fa-times form-control-feedback" aria-hidden="true"></span>;
    }

    handleSelect(date) {
        let hasDate = !!date;
        this.setState({ valid: hasDate }, this.props.returnInputValue(hasDate ? date : null));
    }

    render() {
        return (
            <div className="form-group has-feedback">
                <label className="control-label" htmlFor={ this.props.inputID } >
                    { this.props.label }
                </label>
                <DatePicker id={ this.props.inputID }
                  required={ true }
                  onSelect={ this.handleSelect }
                  ref="inputdate"
                />
                { this.showValidity() }
            </div>
        );
    }
}
