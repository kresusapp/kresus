import React from 'react';
import { connect } from 'react-redux';

// Global variables
import { get, actions } from '../../../store';
import { translate as $t, notify } from '../../../helpers';

import DisplayIf from '../../ui/display-if';
import PasswordInput from '../../ui/password-input';

class ImportModule extends React.Component {
    state = {
        jsonContent: null,
        password: null
    };

    refInput = React.createRef();
    refPassword = React.createRef();

    handleChangePassword = e => {
        let password = e.target.value;
        if (!password.length) {
            password = null;
        }
        this.setState({
            password
        });
    };

    handleLoadFile = e => {
        let fileReader = new FileReader();
        fileReader.onload = fileEvent => {
            let jsonContent;
            try {
                jsonContent = JSON.parse(fileEvent.target.result);
            } catch (err) {
                if (err instanceof SyntaxError) {
                    notify.error($t('client.settings.import_invalid_json'));
                } else {
                    notify.error($t('client.general.unexpected_error', { error: err.message }));
                }
                this.resetForm();
                return;
            }
            this.setState(
                {
                    jsonContent,
                    password: null
                },
                () => {
                    if (jsonContent.encrypted) {
                        this.refPassword.current.focus();
                    }
                }
            );
        };
        fileReader.readAsText(e.target.files[0]);
    };

    resetForm = () => {
        this.setState({
            jsonContent: null,
            password: null
        });
        this.refInput.current.value = null;
    };

    resetOnSubmit = () => {
        if (this.props.dontResetOnSubmit) {
            return;
        }
        this.resetForm();
    };

    handleSubmit = async () => {
        let { jsonContent, password } = this.state;
        // Keep retro-compatibility with older import formats, which
        // didn't have the data field.
        let data = typeof jsonContent.data !== 'undefined' ? jsonContent.data : jsonContent;
        if (jsonContent.encrypted) {
            try {
                await this.props.importInstanceWithPassword(data, password);
                this.resetOnSubmit();
            } catch (err) {
                // Focus on the password to give the user another chance.
                this.refPassword.current.focus();
            }
        } else {
            try {
                await this.props.importInstanceWithoutPassword(data);
                this.resetOnSubmit();
            } catch (err) {
                // Don't reset the form.
            }
        }
    };

    render() {
        let hasEncryptedContent = !!(this.state.jsonContent && this.state.jsonContent.encrypted);
        let disableSubmit =
            !this.state.jsonContent || (hasEncryptedContent && this.state.password === null);

        return (
            <div>
                <p>
                    <input
                        className="file-input"
                        type="file"
                        ref={this.refInput}
                        onChange={this.handleLoadFile}
                    />
                </p>

                <DisplayIf condition={hasEncryptedContent}>
                    <DisplayIf condition={this.props.canEncrypt}>
                        <div className="backup-import-form alerts info">
                            <label htmlFor="import-password">
                                <span>{$t('client.settings.provide_password')}</span>
                            </label>
                            <PasswordInput
                                id="import-password"
                                ref={this.refPassword}
                                onChange={this.handleChangePassword}
                                autofocus={true}
                            />
                        </div>
                    </DisplayIf>

                    <DisplayIf condition={!this.props.canEncrypt}>
                        {$t('client.settings.cannot_decrypt_import')}
                    </DisplayIf>
                </DisplayIf>

                <div className="buttons-toolbar">
                    <DisplayIf condition={!!this.props.cancelButton}>
                        {this.props.cancelButton}
                    </DisplayIf>

                    <button
                        className="btn primary"
                        tabIndex="0"
                        disabled={disableSubmit}
                        onClick={this.handleSubmit}>
                        {$t('client.settings.go_import_instance')}
                    </button>
                </div>
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
                return actions.importInstance(dispatch, data);
            },
            importInstanceWithPassword(data, password) {
                return actions.importInstance(dispatch, data, password);
            }
        };
    }
)(ImportModule);

Export.defaultProps = {
    dontResetOnSubmit: false
};

export default Export;
