import React from 'react';

import { assertHas } from '../../helpers';

export default class ValidableInputText extends React.Component {
    constructor(props) {
        assertHas(props, 'returnInputValue');
        assertHas(props, 'inputID');
        assertHas(props, 'label');
        super(props);
        this.state = { valid: false };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange() {
        let title = this.refs.text.value.trim();
        if (title.length > 0) {
            this.setState({ valid: true }, this.props.returnInputValue(title));
        } else {
            this.setState({ valid: false }, this.props.returnInputValue(null));
        }
    }

    clear() {
        this.refs.text.value = '';
        this.handleChange();
    }

    showValidity() {
        if (this.state.valid) {
            return (<span
              className="fa fa-check form-control-feedback"
              aria-hidden="true"
            />);
        }
        return (<span
          className="fa fa-times form-control-feedback"
          aria-hidden="true"
        />);
    }

    render() {
        return (
            <div className="form-group has-feedback">
                <label
                  className="control-label"
                  htmlFor={ this.props.inputID }>
                    { this.props.label }
                </label>
                <input
                  type="text"
                  className="form-control"
                  id={ this.props.inputID }
                  ref="text"
                  required={ true }
                  onChange={ this.handleChange }
                />
                { this.showValidity() }
            </div>
        );
    }
}
