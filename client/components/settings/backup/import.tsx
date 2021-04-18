import React, { useCallback, useReducer, useState } from 'react';
import { useDispatch } from 'react-redux';

// Global variables
import { get, actions } from '../../../store';
import { get as getErrorCode, genericErrorHandler } from '../../../errors';
import { translate as $t, notify, useKresusState, assert } from '../../../helpers';

import DisplayIf from '../../ui/display-if';
import PasswordInput from '../../ui/password-input';
import FileInput, { FileInputRef } from '../../ui/file-input';
import { CAN_ENCRYPT } from '../../../../shared/instance';
import { useEffectUpdate } from '../../../hooks';
import { Form } from '../../ui';

const handleError = (error: any) => {
    switch (error.errCode) {
        case getErrorCode('INVALID_ENCRYPTED_EXPORT'):
            notify.error($t('client.settings.invalid_encrypted_export'));
            break;
        case getErrorCode('INVALID_PASSWORD_JSON_EXPORT'):
            notify.error($t('client.settings.invalid_password_json_export'));
            break;
        default:
            genericErrorHandler(error);
            break;
    }
};

const Import = (props: { cancelButton?: JSX.Element; dontResetOnSubmit?: boolean }) => {
    const canEncrypt = useKresusState(state => get.boolInstanceProperty(state, CAN_ENCRYPT));

    const [doc, setDoc] = useState<{
        textContent: string | null;
        jsonContent: {
            encrypted?: boolean;
            data?: Record<string, unknown>;
        } | null;
        type: 'json' | 'ofx';
    }>({
        textContent: null,
        jsonContent: null,
        type: 'json',
    });

    const [password, setPassword] = useState<string | null>(null);

    const refFileInput = React.useRef<FileInputRef>(null);
    const refPassword = React.createRef<HTMLInputElement>();
    const [observeFormReset, dispatchFormReset] = useReducer((x: number) => x + 1, 0);
    const [observeShowPassword, dispatchShowPassword] = useReducer((x: number) => x + 1, 0);

    const resetForm = useCallback(() => {
        setDoc({
            textContent: null,
            jsonContent: null,
            type: 'json',
        });
        setPassword(null);
        dispatchFormReset();
    }, [dispatchFormReset, setPassword, setDoc]);

    const handleContentChange = useCallback(
        (textContent: string | null, newType?: 'json' | 'ofx') => {
            const importType = newType || doc.type;
            let jsonContent = null;

            // The content might already be an object if already parsed but with a different type.
            if (importType === 'json' && textContent !== null) {
                try {
                    jsonContent = JSON.parse(textContent);
                } catch (err) {
                    if (err instanceof SyntaxError) {
                        notify.error($t('client.settings.import_invalid_json'));
                    } else {
                        notify.error($t('client.general.unexpected_error', { error: err.message }));
                    }
                    resetForm();
                    return;
                }
            }

            setDoc({ textContent, jsonContent, type: importType });
            setPassword(null);
            dispatchShowPassword();
        },
        [doc.type, setDoc, setPassword, dispatchShowPassword, resetForm]
    );

    useEffectUpdate(() => {
        if (doc.jsonContent && doc.jsonContent.encrypted && refPassword.current) {
            refPassword.current.focus();
        }
    }, [observeShowPassword, doc]);

    const handleTypeChange = useCallback(
        e => {
            handleContentChange(doc.textContent, e.target.value);
        },
        [doc, handleContentChange]
    );

    useEffectUpdate(() => {
        assert(refFileInput.current !== null, 'input must be mounted');
        refFileInput.current.clear();
    }, [observeFormReset]);

    const { dontResetOnSubmit } = props;
    const resetOnSubmit = useCallback(() => {
        if (dontResetOnSubmit) {
            return;
        }
        resetForm();
    }, [resetForm, dontResetOnSubmit]);

    const dispatch = useDispatch();

    const handleSubmit = useCallback(async () => {
        const { textContent, jsonContent, type } = doc;

        if (type === 'ofx') {
            assert(textContent !== null, 'text content must have been set');
            try {
                await actions.importInstance(dispatch, textContent, 'ofx');
                resetOnSubmit();
                notify.success($t('client.settings.successful_import'));
            } catch (err) {
                // Don't reset the form.
                handleError(err);
            }
            return;
        }

        // Keep retro-compatibility with older import formats, which
        // didn't have the data field.
        assert(jsonContent !== null, 'json content must be set');
        const data = typeof jsonContent.data !== 'undefined' ? jsonContent.data : jsonContent;

        try {
            await actions.importInstance(
                dispatch,
                data,
                'json',
                password !== null ? password : undefined
            );
            resetOnSubmit();
            notify.success($t('client.settings.successful_import'));
        } catch (err) {
            if (jsonContent.encrypted) {
                // Focus on the password to give the user another chance.
                assert(refPassword.current !== null, 'password input must be mounted');
                refPassword.current.focus();
            }
            // Don't reset the form.
            handleError(err);
        }
    }, [dispatch, refPassword, doc, password, resetOnSubmit]);

    const hasEncryptedContent = !!(
        doc.jsonContent &&
        doc.jsonContent.encrypted &&
        doc.type === 'json'
    );

    const disableSubmit =
        !doc.textContent && (!doc.jsonContent || (hasEncryptedContent && password === null));

    return (
        <div className="backup-import-form">
            <p className="data-and-format">
                <label>
                    {$t('client.settings.import_format')}
                    <select onChange={handleTypeChange} value={doc.type}>
                        <option value="json">Kresus JSON</option>
                        <option value="ofx">OFX</option>
                    </select>
                </label>

                <FileInput ref={refFileInput} onChange={handleContentChange} />
            </p>

            <DisplayIf condition={hasEncryptedContent}>
                <DisplayIf condition={canEncrypt}>
                    <div className="alerts info">
                        <label htmlFor="import-password">
                            {$t('client.settings.provide_password')}
                        </label>
                        <PasswordInput
                            id="import-password"
                            ref={refPassword}
                            onChange={setPassword}
                            autoFocus={true}
                        />
                    </div>
                </DisplayIf>

                <DisplayIf condition={!canEncrypt}>
                    {$t('client.settings.cannot_decrypt_import')}
                </DisplayIf>
            </DisplayIf>

            <Form.Toolbar>
                <button
                    className="btn primary"
                    tabIndex={0}
                    disabled={disableSubmit}
                    onClick={handleSubmit}>
                    {$t('client.settings.go_import_instance')}
                </button>
                {props.cancelButton}
            </Form.Toolbar>
        </div>
    );
};

Import.displayName = 'ImportModule';

export default Import;
