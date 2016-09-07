import React from 'react';

import { assertHas } from '../../helpers';

export default class AmountInput extends React.Component {
    constructor(props) {
        assertHas(props, 'onChange');
        assertHas(props, 'inputRef')
        super(props);
        this.state = { isNegative: true };
        this.handleChange = this.props.onChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }
    
    handleClick() {
        console.log("OK");
        this.setState({ isNegative: !this.state.isNegative },  this.handleChange());
    }
    
    getValue() {
        return this.state.isNegative ? - this.refs[`input-#{this.props.inputRef}`].value : this.refs[`input-#{this.props.inputRef}`].value;
    }
    
    render() {
        return (
            <div className="input-group">
                <span className="input-group-addon" onClick= { this.handleClick } id={ `sign-#{this.props.inputRef}` }>
                    { this.state.isNegative ? '-' : '+'}
                </span>
                <input type="number" className="form-control" ref={ `input-#{this.props.inputRef}` } onChange={ this.handleChange }  aria-describedby={ `sign-#{this.props.inputRef}` }/>
            </div>
        );
    }
}