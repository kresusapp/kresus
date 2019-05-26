import React from 'react';
import { connect } from 'react-redux';

// Global variables
import { get, actions } from '../../../store';
import { translate as $t, notify } from '../../../helpers';

import DisplayIf from '../../ui/display-if';

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
                let json;

                try {
                    json = JSON.parse(fileEvent.target.result);
                } catch (err) {
                    if (err instanceof SyntaxError) {
                        notify.error($t('client.settings.import_invalid_json'));
                    } else {
                        notify.error($t('client.general.unexpected_error', { error: err.message }));
                    }
                }

                // Keep retro-compatibility with older import formats, which
                // didn't have the data field.
                let data = typeof json.data !== 'undefined' ? json.data : json;

                if (this.state.withPassword) {
                    // Note this works also with older import formats, which
                    // didn't let you encrypt an export.
                    if (!json.encrypted) {
                        notify.error($t('client.settings.error_decrypt_non_encrypted'));
                        return;
                    }
                    this.props.importInstanceWithPassword(data, this.refPassword.current.value);
                } else {
                    if (json.encrypted) {
                        notify.error($t('client.settings.error_non_decrypt_encrypted'));
                        return;
                    }
                    this.props.importInstanceWithoutPassword(data);
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
                <DisplayIf condition={this.props.canEncrypt}>
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
                </DisplayIf>

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
    state => {
        return {
            canEncrypt: get.boolSetting(state, 'can-encrypt')
        };
    },
    dispatch => {
        return {
            importInstanceWithoutPassword(data) {
                actions.importInstance(dispatch, data);
            },
            importInstanceWithPassword(data, password) {
                actions.importInstance(dispatch, data, password);
            }
        };
    }
)(ImportModule);

export default Export;
