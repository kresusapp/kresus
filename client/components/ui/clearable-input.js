import React from 'react';
import PropTypes from 'prop-types';

import { translate as $t } from '../../helpers';

class ClearableInput extends React.PureComponent {
    state = {
        value: this.props.value || ''
    };

    onChange = value => {
        this.setState({ value }, () => {
            if (typeof this.props.onChange === 'function') {
                this.props.onChange(this.state.value.trim());
            }
        });
    };

    handleChange = e => {
        this.onChange(e.target.value);
    };

    handleClear = () => {
        this.onChange('');
    };

    clear = () => {
        this.setState({ value: '' });
    };

    render() {
        return (
            <div className="input-with-addon clearable-input">
                <input
                    type={this.props.type}
                    id={this.props.id}
                    onChange={this.handleChange}
                    value={this.state.value}
                    placeholder={this.props.placeholder}
                />
                <button
                    type="button"
                    className="btn"
                    onClick={this.handleClear}
                    title={$t('client.search.clear')}>
                    <span className="screen-reader-text">X</span>
                    <i className="fa fa-times" aria-hidden="true" />
                </button>
            </div>
        );
    }
}

ClearableInput.propTypes = {
    // Type
    type: PropTypes.string,

    // Initial value.
    value: PropTypes.string,

    // An id to link the input to a label for instance.
    id: PropTypes.string,

    // Placeholder
    placeholder: PropTypes.string,

    // onChange function called with the value.
    onChange: PropTypes.func
};

ClearableInput.defaultProps = {
    type: 'text',
    placeholder: ''
};

export default ClearableInput;
