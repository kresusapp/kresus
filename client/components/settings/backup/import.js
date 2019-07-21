import React from 'react';
import { connect } from 'react-redux';

// Global variables
import { get, actions } from '../../../store';
import { translate as $t, notify } from '../../../helpers';

import DisplayIf from '../../ui/display-if';
import PasswordInput from '../../ui/password-input';

class ImportModule extends React.Component {
    state = {
        rawContent: null,
        content: null,
        password: null,
        type: 'json'
    };

    refInput = React.createRef();
    refPassword = React.createRef();

    reparseContent(data, newType) {
        let rawContent = data || null;
        let content = rawContent;
        let type = newType || this.state.type;

        // The content might already be an object if already parsed but with a different type.
        if (type === 'json') {
            try {
                content = JSON.parse(rawContent);
            } catch (err) {
                if (err instanceof SyntaxError) {
                    notify.error($t('client.settings.import_invalid_json'));
                } else {
                    notify.error($t('client.general.unexpected_error', { error: err.message }));
                }
                this.resetForm();
                return;
            }
        }

        this.setState(
            {
                rawContent,
                content,
                password: null,
                type
            },
            () => {
                if (content && content.encrypted && this.refPassword.current) {
                    this.refPassword.current.focus();
                }
            }
        );
    }

    handleTypeChange = e => {
        this.reparseContent(this.state.rawContent, e.target.value);
    };

    handleChangePassword = password => {
        this.setState({
            password
        });
    };

    handleLoadFile = e => {
        let fileReader = new FileReader();
        fileReader.onload = fileEvent => {
            this.reparseContent(fileEvent.target.result);
        };
        fileReader.readAsText(e.target.files[0]);
    };

    resetForm = () => {
        this.setState({
            rawContent: null,
            content: null,
            password: null,
            type: 'json'
        });
        this.refInput.current.value = null;
    };

    resetOnSubmit = () => {
        if (this.props.dontResetOnSubmit) {
            return;
        }
        this.resetForm();
    };

    handleSubmit = async event => {
        event.preventDefault();

        let { content, password, type } = this.state;

        if (type === 'ofx') {
            try {
                await this.props.importOFX(content);
                this.resetOnSubmit();
            } catch (err) {
                // Don't reset the form.
            }
            return;
        }

        // Keep retro-compatibility with older import formats, which
        // didn't have the data field.
        let data = typeof content.data !== 'undefined' ? content.data : content;
        if (content.encrypted) {
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
        let hasEncryptedContent = !!(
            this.state.content &&
            this.state.content.encrypted &&
            this.state.type === 'json'
        );

        let disableSubmit =
            !this.state.content || (hasEncryptedContent && this.state.password === null);

        return (
            <div className="backup-import-form">
                <p className="data-and-format">
                    <label>
                        {$t('client.settings.import_format')}
                        <select onChange={this.handleTypeChange} value={this.state.type}>
                            <option value="json">Kresus JSON</option>
                            <option value="ofx">OFX</option>
                        </select>
                    </label>

                    <input
                        className="file-input"
                        type="file"
                        ref={this.refInput}
                        onChange={this.handleLoadFile}
                    />
                </p>

                <DisplayIf condition={hasEncryptedContent}>
                    <DisplayIf condition={this.props.canEncrypt}>
                        <div className="alerts info">
                            <label htmlFor="import-password">
                                {$t('client.settings.provide_password')}
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
                return actions.importInstance(dispatch, data, 'json');
            },
            importInstanceWithPassword(data, password) {
                return actions.importInstance(dispatch, data, 'json', password);
            },
            importOFX(data) {
                return actions.importInstance(dispatch, data, 'ofx');
            }
        };
    }
)(ImportModule);

Export.defaultProps = {
    dontResetOnSubmit: false
};

export default Export;
