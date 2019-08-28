import React from 'react';
import { connect } from 'react-redux';

import { translate as $t, validatePassword } from '../../../helpers';
import { actions, get } from '../../../store';
import DisplayIf from '../../ui/display-if';

const Export = connect(
    state => {
        return {
            isExporting: get.isExporting(state),
            canEncrypt: get.boolSetting(state, 'can-encrypt')
        };
    },
    dispatch => {
        return {
            handleExportWithPassword(password) {
                actions.exportInstance(dispatch, password);
            },
            handleExportWithoutPassword() {
                actions.exportInstance(dispatch);
            }
        };
    }
)(
    class ExportSection extends React.Component {
        state = {
            withPassword: false,
            validPassword: false,
            passwordError: null
        };

        refPassword = React.createRef();

        // Show password error only on blur.
        handleBlurPassword = () => {
            let passwordError = this.state.validPassword
                ? null
                : $t('client.settings.weak_password');
            this.setState({ passwordError });
        };

        // Update export button disabled state on every password change.
        handleChangePassword = () => {
            let validPassword = validatePassword(this.refPassword.current.value);
            this.setState({
                validPassword,
                passwordError: null
            });
        };

        handleToggleWithPassword = () => {
            this.setState(
                {
                    withPassword: !this.state.withPassword,
                    validPassword: false,
                    passwordError: null
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

        handleSubmit = () => {
            if (this.state.withPassword) {
                let password = this.refPassword.current.value;
                this.props.handleExportWithPassword(password);
            } else {
                this.props.handleExportWithoutPassword();
            }
        };

        render() {
            let buttonText;
            if (this.props.isExporting) {
                buttonText = $t('client.settings.exporting');
            } else {
                buttonText = $t('client.settings.go_export_instance');
            }

            let submitDisabled =
                this.props.isExporting || (this.state.withPassword && !this.state.validPassword);

            return (
                <div>
                    <DisplayIf condition={this.props.canEncrypt}>
                        <div className="backup-export-form">
                            <label htmlFor="encrypt_with_password">
                                <input
                                    id="encrypt_with_password"
                                    type="checkbox"
                                    onChange={this.handleToggleWithPassword}
                                />
                                <span>{$t('client.settings.encrypt_with_password')}</span>
                            </label>
                            <input
                                type="password"
                                ref={this.refPassword}
                                onChange={this.handleChangePassword}
                                onBlur={this.handleBlurPassword}
                                disabled={!this.state.withPassword}
                            />
                            <DisplayIf
                                condition={this.state.withPassword && !!this.state.passwordError}>
                                <span>{this.state.passwordError}</span>
                            </DisplayIf>
                        </div>
                    </DisplayIf>

                    <button
                        type="button"
                        id="exportInstance"
                        className="btn primary"
                        onClick={this.handleSubmit}
                        disabled={submitDisabled}>
                        {buttonText}
                    </button>

                    <DisplayIf condition={this.props.isExporting}>
                        <span className="fa fa-spinner" />
                    </DisplayIf>
                </div>
            );
        }
    }
);

export default Export;
