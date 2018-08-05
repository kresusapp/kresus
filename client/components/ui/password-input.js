import React from 'react';
import PropTypes from 'prop-types';

import { translate as $t } from '../../helpers';

class PasswordInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showPassword: false
        };

        this.input = null;
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleClick() {
        this.setState({
            showPassword: !this.state.showPassword
        });
    }

    focus() {
        this.input.focus();
    }

    clear() {
        this.input.value = '';
    }

    handleChange(event) {
        event.target.value = (event.target.value || '').trim();
        this.props.onChange(event);
    }

    render() {
        let refInput = node => {
            this.input = node;
        };

        let iconClass;
        let type;
        let title;
        let accessibleIconClass;

        if (this.state.showPassword) {
            iconClass = 'eye-slash';
            type = 'text';
            title = $t('client.general.hide_password');
            accessibleIconClass = $t('client.general.hidden');
        } else {
            iconClass = 'eye';
            type = 'password';
            title = $t('client.general.show_password');
            accessibleIconClass = $t('client.general.shown');
        }

        let maybeClassName = this.props.className ? this.props.className : '';

        return (
            <div className={`input-with-addon ${maybeClassName}`}>
                <input
                    type={type}
                    id={this.props.id}
                    ref={refInput}
                    placeholder={this.props.placeholder}
                    onChange={this.handleChange}
                    autoComplete="new-password"
                    autoFocus={this.props.autoFocus}
                    defaultValue={this.props.defaultValue}
                />
                <button type="button" className="kbtn" onClick={this.handleClick} title={title}>
                    <span className="sr-only">{accessibleIconClass}</span>
                    <i className={`fa fa-${iconClass}`} aria-hidden="true" />
                </button>
            </div>
        );
    }
}

PasswordInput.propTypes = {
    // The id attribute used to match labels.
    id: PropTypes.string.isRequired,

    // The input's placeholder.
    placeholder: PropTypes.string,

    // A function called when the input changes.
    onChange: PropTypes.func,

    // The defaultValue of the input.
    defaultValue: PropTypes.string,

    // Extra class names to pass to the input
    className: PropTypes.string,

    // Tells whether the input has focus on mounting the component
    autoFocus: PropTypes.bool
};

PasswordInput.defaultProps = {
    autoFocus: false
};

export default PasswordInput;
