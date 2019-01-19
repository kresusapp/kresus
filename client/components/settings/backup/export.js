import React from 'react';
import { connect } from 'react-redux';

import { translate as $t, validatePassword } from '../../../helpers';
import { actions, get } from '../../../store';

const Export = connect(
    state => {
        return {
            isExporting: get.isExporting(state)
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
            let maybeSpinner;
            if (this.props.isExporting) {
                buttonText = $t('client.settings.exporting');
                maybeSpinner = <span className="fa fa-spinner" />;
            } else {
                buttonText = $t('client.settings.go_export_instance');
                maybeSpinner = null;
            }

            let maybePasswordError = this.state.withPassword ? (
                <span>{this.state.passwordError}</span>
            ) : null;
            let submitDisabled =
                this.props.isExporting || (this.state.withPassword && !this.state.validPassword);

            return (
                <div>
                    <div className="backup-password-form">
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
                        {maybePasswordError}
                    </div>
                    <button
                        type="button"
                        id="exportInstance"
                        className="btn primary"
                        onClick={this.handleSubmit}
                        disabled={submitDisabled}>
                        {buttonText}
                    </button>
                    {maybeSpinner}
                </div>
            );
        }
    }
);

export default Export;
