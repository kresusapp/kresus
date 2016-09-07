import React from 'react';

import { assertHas, translate as $t } from '../../helpers';

export default class AmountInput extends React.Component {
    constructor(props) {
        assertHas(props, 'onChange');
        assertHas(props, 'inputRef');
        super(props);
        this.state = { isNegative: true };
        this.handleChange = this.props.onChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }
    
    handleClick() {
        this.setState({ isNegative: !this.state.isNegative },  this.handleChange);
    }
    
    getValue() {
        let value = this.refs[`input-${this.props.inputRef}`].value;
        if (value === '') {
            return '';
        }
        return this.state.isNegative ? - value : value;
    }
    
    render() {
        return (
            <div className="input-group">
                <span className="input-group-addon" onClick= { this.handleClick } id={ `sign-${this.props.inputRef}` }
                  title={ $t('client.toggle_sign') }>
                    <i className={ `fa fa-${this.state.isNegative ? 'minus' : 'plus'}` }></i>
                </span>
                <input type="number" className="form-control" ref={ `input-${this.props.inputRef}` } onChange={ this.handleChange }  aria-describedby={ `sign-#{this.props.inputRef}` }/>
            </div>
        );
    }
}