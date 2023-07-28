import React, { useCallback, useReducer, useState } from 'react';
import { useDispatch } from 'react-redux';

// Global variables
import { get, actions } from '../../../store';
import { get as getErrorCode, genericErrorHandler } from '../../../errors';
import { translate as $t, notify, useKresusState, assert } from '../../../helpers';

import DisplayIf from '../../ui/display-if';
import PasswordInput from '../../ui/password-input';
import Form from '../../ui/form';
import FileInput, { FileInputRef } from '../../ui/file-input';
import Select, { ComboboxProps } from '../../ui/fuzzy-or-native-select';
import { CAN_ENCRYPT } from '../../../../shared/instance';
import { useEffectUpdate } from '../../../hooks';

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

const ImportForm = (props: {
    type: 'ofx' | 'json';
    title?: string;
    helper?: string;
    dontResetOnSubmit?: boolean;
    isMonoAccess?: boolean;
}) => {
    const canEncrypt = useKresusState(state => get.boolInstanceProperty(state, CAN_ENCRYPT));
    const accessesMap = useKresusState(state => get.accessMap(state));

    const [doc, setDoc] = useState<{
        textContent: string | null;
        jsonContent: {
            encrypted?: boolean;
            data?: Record<string, unknown>;
        } | null;
        accessId?: number | null;
    }>({
        textContent: null,
        jsonContent: null,
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
            accessId: null,
        });
        setPassword(null);
        dispatchFormReset();
    }, [dispatchFormReset, setPassword, setDoc]);

    const handleAccessChange = useCallback(
        (accessId: string | null) => {
            setDoc({
                textContent: doc.textContent,
                jsonContent: doc.jsonContent,
                accessId: accessId && accessId !== 'new' ? parseInt(accessId, 10) || null : null,
            });
        },
        [doc, setDoc]
    );

    const handleContentChange = useCallback(
        (textContent: string | null) => {
            let jsonContent = null;

            // The content might already be an object if already parsed but with a different type.
            if (props.type === 'json' && textContent !== null) {
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

            setDoc({ textContent, jsonContent, accessId: doc.accessId });
            setPassword(null);
            dispatchShowPassword();
        },
        [props.type, doc.accessId, setDoc, setPassword, dispatchShowPassword, resetForm]
    );

    useEffectUpdate(() => {
        if (doc.jsonContent && doc.jsonContent.encrypted && refPassword.current) {
            refPassword.current.focus();
        }
    }, [observeShowPassword, doc]);

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
        const { textContent, jsonContent, accessId } = doc;

        if (props.type === 'ofx') {
            assert(textContent !== null, 'text content must have been set');
            try {
                await actions.importInstance(
                    dispatch,
                    JSON.stringify({
                        accessId,
                        data: textContent,
                    }),
                    'ofx'
                );
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
    }, [dispatch, props.type, refPassword, doc, password, resetOnSubmit]);

    const accessesOptions: ComboboxProps['options'] = [
        {
            label: $t('client.general.new'),
            value: 'new',
        },
    ];

    for (const accId in accessesMap) {
        if (!accessesMap.hasOwnProperty(accId)) {
            continue;
        }

        const access = accessesMap[accId];
        accessesOptions.push({
            label: access.customLabel || access.label,
            value: accId.toString(),
        });
    }

    const hasEncryptedContent = !!(
        props.type === 'json' &&
        doc.jsonContent &&
        doc.jsonContent.encrypted
    );

    const disableSubmit =
        !doc.textContent && (!doc.jsonContent || (hasEncryptedContent && password === null));

    return (
        <div className="backup-import-form">
            <DisplayIf condition={!!props.title}>
                <h3>{props.title}</h3>
            </DisplayIf>

            <div>
                <DisplayIf condition={!!props.helper}>
                    <p>{props.helper}</p>
                </DisplayIf>

                <DisplayIf condition={!!props.isMonoAccess && accessesOptions.length > 1}>
                    <Form.Input id="access" label={$t('client.settings.bank')}>
                        <Select
                            className={`form-element-block`}
                            onChange={handleAccessChange}
                            options={accessesOptions}
                            placeholder={$t('client.general.select')}
                            required={true}
                            value={accessesOptions[0].value}
                        />
                    </Form.Input>
                </DisplayIf>

                <p className="data-and-format">
                    <label>{$t('client.general.select_file')}</label>

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
            </div>

            <Form.Toolbar>
                <button
                    className="btn primary"
                    tabIndex={0}
                    disabled={disableSubmit}
                    onClick={handleSubmit}>
                    {$t('client.settings.go_import_instance')}
                </button>
            </Form.Toolbar>
        </div>
    );
};

export default ImportForm;
