import React, { useCallback, useState } from 'react';
import { connect } from 'react-redux';

import { assert, translate as $t, validatePassword } from '../../../helpers';
import { CAN_ENCRYPT } from '../../../../shared/instance';
import { actions, get } from '../../../store';
import DisplayIf from '../../ui/display-if';
import { Switch, LoadingButton } from '../../ui';

import { useNotifyError } from '../../../hooks';

const finishExport = content => {
    let blob;
    let extension;
    if (typeof content === 'object') {
        blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
        extension = 'json';
    } else {
        assert(typeof content === 'string');
        blob = new Blob([content], { type: 'txt' });
        extension = 'txt';
    }
    const url = URL.createObjectURL(blob);

    // Get the current date without time, as a string. Ex: "2020-04-11".
    const date = new Date().toISOString().substr(0, 10);
    const filename = `kresus-backup_${date}.${extension}`;

    try {
        // Create a fake link and simulate a click on it.
        const anchor = document.createElement('a');
        anchor.setAttribute('href', url);
        anchor.setAttribute('download', filename);

        const event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        anchor.dispatchEvent(event);
    } catch (e) {
        // Revert to a less friendly method if the previous doesn't work.
        window.open(url, '_blank');
    }

    // Remove the file as we don't need it anymore.
    URL.revokeObjectURL(url);
};

const ExportButton = ({ disabled, onClick: propOnClick }) => {
    const [isLoading, setIsLoading] = useState(false);

    const safeOnClick = useNotifyError('client.settings.export_instance_error', propOnClick);

    const onClick = useCallback(async () => {
        setIsLoading(true);
        await safeOnClick();
        setIsLoading(false);
    }, [setIsLoading, safeOnClick]);

    const label = isLoading
        ? $t('client.settings.exporting')
        : $t('client.settings.go_export_instance');

    return (
        <LoadingButton
            onClick={onClick}
            isLoading={isLoading}
            className="primary"
            label={label}
            disabled={disabled}
        />
    );
};

const Export = connect(state => {
    return {
        canEncrypt: get.boolInstanceProperty(state, CAN_ENCRYPT),
    };
})(
    class ExportSection extends React.Component {
        state = {
            withPassword: false,
            validPassword: false,
            passwordError: null,
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
                passwordError: null,
            });
        };

        handleToggleWithPassword = checked => {
            this.setState(
                {
                    withPassword: checked,
                    validPassword: false,
                    passwordError: null,
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

        handleSubmit = async () => {
            let password;
            if (this.state.withPassword) {
                password = this.refPassword.current.value;
            }

            const content = await actions.exportInstance(password);
            finishExport(content);
        };

        render() {
            let submitDisabled = this.state.withPassword && !this.state.validPassword;

            return (
                <div>
                    <DisplayIf condition={this.props.canEncrypt}>
                        <div className="backup-export-form">
                            <label htmlFor="encrypt_with_password">
                                <Switch
                                    id="encrypt_with_password"
                                    onChange={this.handleToggleWithPassword}
                                    checked={this.state.withPassword}
                                    ariaLabel={$t('client.settings.encrypt_with_password')}
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

                    <ExportButton onClick={this.handleSubmit} disabled={submitDisabled} />
                </div>
            );
        }
    }
);

export default Export;
