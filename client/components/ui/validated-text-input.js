import React from 'react';
import PropTypes from 'prop-types';

// A ValidableInputText is a form group for a text input with a hint that it
// must not be empty.

class ValidableInputText extends React.Component {
    refInput = node => (this.input = node);

    handleChange = () => {
        let title = this.input.value.trim();
        this.props.onChange(title.length ? title : null);
    };

    clear() {
        this.input.value = '';
        this.handleChange();
    }

    render() {
        return (
            <input
                type="text"
                className={'form-element-block check-validity'}
                id={this.props.id}
                ref={this.refInput}
                required={true}
                pattern="\S+.*"
                onChange={this.handleChange}
            />
        );
    }
}

ValidableInputText.propTypes = {
    // Callback receiving the validated text input.
    onChange: PropTypes.func.isRequired,

    // CSS id for the text input.
    id: PropTypes.string.isRequired
};

export default ValidableInputText;
