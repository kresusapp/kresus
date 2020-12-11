import React, { useState, useCallback, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { actions } from '../../store';
import { notify, translate as $t } from '../../helpers';
import DisplayIf from '../ui/display-if';
import { Form, ValidatedTextInput } from '../ui';
import { ValidatedTextInputRef } from '../ui/validated-text-input';

interface Field {
    id: string;
    label?: string;
}

interface UserAction {
    fields: Field[];
    message?: string;
    finish: (fields: Record<string, string>) => (dispatch: Dispatch) => Promise<void>;
}

interface UserActionFormNativeProps {
    action: UserAction;
}

interface UserActionFormProps extends UserActionFormNativeProps {
    onSubmit: (fields: Record<string, string>) => Promise<void>;
}

const UserActionForm = connect(null, (dispatch: Dispatch, props: UserActionFormNativeProps) => {
    return {
        async onSubmit(fields: Record<string, string>) {
            try {
                const action = props.action.finish(fields);
                await action(dispatch);
                actions.finishUserAction(dispatch);
            } catch (err) {
                notify.error(`error when entering 2nd factor: ${err.message}`);
            }
        },
    };
})((props: UserActionFormProps) => {
    const [formFields, setFormFields] = useState({});

    const { onSubmit: onSubmitProps } = props;
    const onSubmit = useCallback(() => onSubmitProps(formFields), [onSubmitProps, formFields]);

    const refFirstInput = useRef<ValidatedTextInputRef>(null);

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
            <Form.Input
                key={key}
                label={field.label || $t('client.user-action.code')}
                id={`field-${field.id}`}>
                <ValidatedTextInput {...extraRef} onChange={makeUpdateField(field.id)} />
            </Form.Input>
        );
    });

    const numFilledFormInputs = Object.values(formFields).filter(x => x !== null).length;
    const submitDisabled = numFilledFormInputs !== (props.action.fields || []).length;

    return (
        <Form className="content" onSubmit={onSubmit}>
            <h1>{$t('client.user-action.title')}</h1>

            <p>{$t('client.user-action.help')}</p>

            <DisplayIf condition={!!props.action.message}>
                <p>
                    <strong>{props.action.message}</strong>
                </p>
            </DisplayIf>

            {/* Typescript does not accept inclusion of Element[] in the component tree,
            see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20356 .
            Wrap Element[] in a fragment to make it an Element.*/}
            <>{fieldForms}</>

            <input
                type="submit"
                className="btn primary"
                onClick={onSubmit}
                disabled={submitDisabled}
                value={$t('client.general.continue')}
            />
        </Form>
    );
});

export default UserActionForm;
