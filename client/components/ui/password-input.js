import React from 'react';

import { translate as $t } from '../../helpers';

class PasswordInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showPassword: false
        };

        this.input = null;
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.setState({
            showPassword: !this.state.showPassword
        });
    }

    getValue() {
        return this.input.value.trim();
    }

    render() {
        let inputCb = node => {
            this.input = node;
        };

        let iconClass = 'eye';
        let type = 'password';

        if (this.state.showPassword) {
            iconClass = 'eye-slash';
            type = 'text';
        }

        return (
            <div className="input-group">
                <input
                  type={ type }
                  className="form-control"
                  id={ this.props.id }
                  ref={ inputCb }
                  placeholder={ this.props.placeholder }
                  name={ this.props.name }
                />
                <span
                  className={ `clickable input-group-addon fa fa-${iconClass}` }
                  onClick={ this.handleClick }
                  title={ $t('client.general.show_password') }
                />
            </div>
        );
    }
}

PasswordInput.propTypes = {
    // The id attribute used to match labels.
    id: React.PropTypes.string.isRequired,

    // The input's name
    name: React.PropTypes.string,

    // The placeholder.
    placeholder: React.PropTypes.string
};

export default PasswordInput;
