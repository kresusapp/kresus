import React, { useState, useCallback, useRef, useEffect } from 'react';
import { connect } from 'react-redux';

import { actions } from '../../store';
import { notify, translate as $t } from '../../helpers';
import DisplayIf from '../ui/display-if';
import { FormRow, FormRowOffset, ValidatedTextInput } from '../ui';

interface Field {
    id: string;
    label?: string;
}

interface UserAction {
    fields: Field[];
    message?: string;
    finish: (fields: Record<string, string>) => Promise<void>;
}

interface UserActionFormNativeProps {
    action: UserAction;
}

interface UserActionFormProps extends UserActionFormNativeProps {
    onSubmit: (fields: Record<string, string>) => Promise<void>;
}

const UserActionForm = connect(null, (dispatch, props: UserActionFormNativeProps) => {
    return {
        async onSubmit(fields: Record<string, string>) {
            try {
                const action = props.action.finish(fields);
                await dispatch(action);
                actions.finishUserAction(dispatch);
            } catch (err) {
                notify.error(`error when entering 2nd factor: ${err.message}`);
            }
        },
    };
})((props: UserActionFormProps) => {
    const [formFields, setFormFields] = useState({});

    const onSubmit = useCallback(
        event => {
            event.preventDefault();
            props.onSubmit(formFields);
        },
        [props, formFields]
    );

    const refFirstInput = useRef<typeof ValidatedTextInput>();

    // Focus on the first input field, if there's one.
    useEffect(() => {
        if (refFirstInput && refFirstInput.current) {
            refFirstInput.current.focus();
        }
    }, [refFirstInput]);

    const makeUpdateField = useCallback(
        fieldId => (value: string | null) => {
            setFormFields(prev => ({
                ...prev,
                [fieldId]: value,
            }));
        },
        []
    );

    const fieldForms = (props.action.fields || []).map((field, key) => {
        const extraRef: { ref?: typeof refFirstInput } = {};
        if (key === 0) {
            extraRef.ref = refFirstInput;
        }

        return (
            <FormRow
                key={key}
                label={field.label || $t('client.user-action.code')}
                inputId={`field-${field.id}`}
                input={<ValidatedTextInput {...extraRef} onChange={makeUpdateField(field.id)} />}
            />
        );
    });

    const numFilledFormInputs = Object.values(formFields).filter(x => x !== null).length;
    const submitDisabled = numFilledFormInputs !== (props.action.fields || []).length;

    return (
        <form className="content" onSubmit={onSubmit}>
            <FormRowOffset>
                <h1>{$t('client.user-action.title')}</h1>

                <p>{$t('client.user-action.help')}</p>

                <DisplayIf condition={!!props.action.message}>
                    <p>
                        <strong>{props.action.message}</strong>
                    </p>
                </DisplayIf>
            </FormRowOffset>

            {fieldForms}

            <FormRowOffset>
                <input
                    type="submit"
                    className="btn primary"
                    onClick={onSubmit}
                    disabled={submitDisabled}
                    value={$t('client.general.continue')}
                />
            </FormRowOffset>
        </form>
    );
});

export default UserActionForm;
