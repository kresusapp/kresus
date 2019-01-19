import React from 'react';
import { connect } from 'react-redux';

// Global variables
import { actions } from '../../../store';
import { translate as $t } from '../../../helpers';

class ImportModule extends React.Component {
    state = {
        withPassword: false,
        validPassword: false
    };

    refPassword = React.createRef();

    handleToggleWithPassword = () => {
        this.setState(
            {
                withPassword: !this.state.withPassword,
                validPassword: false
            },
            () => {
                if (this.state.withPassword) {
                    this.refPassword.current.focus();
                } else {
                    this.refPassword.current.value = '';
                }
            }
        );
    };

    handleChangePassword = () => {
        let validPassword = this.refPassword.current.value.trim().length !== 0;
        this.setState({
            validPassword
        });
    };

    handleSubmit = e => {
        let filename = e.target.value.split('\\').pop();

        if (window.confirm($t('client.settings.confirm_import', { filename }))) {
            let fileReader = new FileReader();
            fileReader.onload = fileEvent => {
                if (this.state.withPassword) {
                    let content = fileEvent.target.result;
                    this.props.importInstanceWithPassword(content, this.refPassword.current.value);
                } else {
                    try {
                        let content = JSON.parse(fileEvent.target.result);
                        this.props.importInstanceWithoutPassword(content);
                    } catch (err) {
                        if (err instanceof SyntaxError) {
                            alert($t('client.settings.import_invalid_json'));
                        } else {
                            alert(`Unexpected error: ${err.message}`);
                        }
                    }
                }
            };

            fileReader.readAsText(e.target.files[0]);
        }

        e.target.value = '';
    };

    handleKeyPress = event => {
        if (event.key === 'Enter') {
            event.target.click();
        }
    };

    render() {
        let disableButton = this.state.withPassword && !this.state.validPassword;

        return (
            <div>
                <div className="backup-password-form">
                    <label htmlFor="decrypt_with_password">
                        <input
                            id="decrypt_with_password"
                            type="checkbox"
                            onChange={this.handleToggleWithPassword}
                        />
                        <span>{$t('client.settings.decrypt_with_password')}</span>
                    </label>
                    <input
                        type="password"
                        ref={this.refPassword}
                        disabled={!this.state.withPassword}
                        onChange={this.handleChangePassword}
                    />
                </div>

                <label
                    className="btn primary"
                    tabIndex="0"
                    role="button"
                    onKeyPress={this.handleKeyPress}
                    disabled={disableButton}>
                    <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={this.handleSubmit}
                        disabled={disableButton}
                    />
                    {$t('client.settings.go_import_instance')}
                </label>
            </div>
        );
    }
}

const Export = connect(
    null,
    dispatch => {
        return {
            importInstanceWithoutPassword(content) {
                actions.importInstance(dispatch, content);
            },
            importInstanceWithPassword(content, password) {
                actions.importInstance(dispatch, content, password);
            }
        };
    }
)(ImportModule);

export default Export;
