import React, { useCallback, useReducer, useState } from 'react';

import { assert, translate as $t, useKresusState, validatePassword } from '../../../helpers';
import { CAN_ENCRYPT } from '../../../../shared/instance';
import { actions, get } from '../../../store';
import DisplayIf from '../../ui/display-if';
import { Switch, LoadingButton } from '../../ui';

import { useEffectUpdate, useNotifyError } from '../../../hooks';

const finishExport = (content: Record<string, unknown> | string) => {
    let blob;
    let extension;
    if (typeof content === 'object') {
        blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
        extension = 'json';
    } else {
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

const ExportButton = ({
    disabled,
    onClick: propOnClick,
}: {
    disabled: boolean;
    onClick: () => Promise<void>;
}) => {
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

const Export = () => {
    const canEncrypt = useKresusState(state => get.boolInstanceProperty(state, CAN_ENCRYPT));

    const [passwordState, setPasswordState] = useState<{
        withPassword: boolean;
        valid: boolean;
        error: string | null;
    }>({
        withPassword: false,
        valid: false,
        error: null,
    });

    const [passwordInputObserver, dispatchPasswordInputEvent] = useReducer((x: number) => x + 1, 0);

    const refPassword = React.createRef<HTMLInputElement>();

    // Update export button disabled state on every password change.
    const handleChangePassword = useCallback(() => {
        assert(refPassword.current !== null, 'password input must be mounted');
        const valid = validatePassword(refPassword.current.value);
        setPasswordState({
            withPassword: true,
            valid,
            error: null,
        });
    }, [refPassword]);

    const handleToggleWithPassword = useCallback(
        (checked: boolean) => {
            setPasswordState({
                withPassword: checked,
                valid: false,
                error: null,
            });
            // Trigger an effect after the state is done updating.
            dispatchPasswordInputEvent();
        },
        [setPasswordState, dispatchPasswordInputEvent]
    );

    // Show password error only on blur.
    const handleBlurPassword = useCallback(() => {
        const error =
            !passwordState.withPassword || passwordState.valid
                ? null
                : $t('client.settings.weak_password');
        setPasswordState(state => ({ ...state, error }));
    }, [setPasswordState, passwordState]);

    useEffectUpdate(() => {
        assert(refPassword.current !== null, 'password input must be mounted');
        if (passwordState.withPassword) {
            refPassword.current.focus();
        } else {
            refPassword.current.value = '';
        }
    }, [passwordInputObserver]);

    const handleSubmit = useCallback(async () => {
        let password;
        if (passwordState.withPassword) {
            assert(refPassword.current !== null, 'password input must be mounted');
            password = refPassword.current.value;
        }
        const content = await actions.exportInstance(password);
        finishExport(content);
    }, [refPassword, passwordState]);

    const submitDisabled = passwordState.withPassword && !passwordState.valid;

    return (
        <>
            <DisplayIf condition={canEncrypt}>
                <div className="backup-export-form">
                    <label htmlFor="encrypt_with_password">
                        <Switch
                            id="encrypt_with_password"
                            onChange={handleToggleWithPassword}
                            checked={passwordState.withPassword}
                            ariaLabel={$t('client.settings.encrypt_with_password')}
                        />
                        <span>{$t('client.settings.encrypt_with_password')}</span>
                    </label>
                    <input
                        type="password"
                        ref={refPassword}
                        onChange={handleChangePassword}
                        onBlur={handleBlurPassword}
                        disabled={!passwordState.withPassword}
                    />
                    <DisplayIf condition={passwordState.withPassword && !!passwordState.error}>
                        <span>{passwordState.error}</span>
                    </DisplayIf>
                </div>
            </DisplayIf>

            <ExportButton onClick={handleSubmit} disabled={submitDisabled} />
        </>
    );
};

Export.displayName = 'ExportInstance';

export default Export;
