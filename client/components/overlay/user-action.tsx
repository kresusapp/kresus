import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { actions } from '../../store';
import { notify, translate as $t } from '../../helpers';

import { Form, ValidatedTextInput } from '../ui';
import DisplayIf from '../ui/display-if';
import { ValidatedTextInputRef } from '../ui/validated-text-input';
import { UserActionRequested } from '../../store/ui';

const UserActionForm = (props: { action: UserActionRequested }) => {
    const [formFields, setFormFields] = useState({});

    const dispatch = useDispatch();
    const onSubmit = useCallback(async () => {
        try {
            const action = props.action.finish(formFields);
            await action(dispatch);
            actions.finishUserAction(dispatch);
        } catch (err) {
            notify.error(`error when entering 2nd factor: ${err.message}`);
        }
    }, [dispatch, props.action, formFields]);

    const refFirstInput = useRef<ValidatedTextInputRef>(null);

    // Focus on the first input field, if there's one.
    useEffect(() => {
        if (refFirstInput && refFirstInput.current) {
            refFirstInput.current.focus();
        }
    }, [refFirstInput]);

    const makeUpdateField = useCallback(
        (fieldId: string) => (value: string | null) => {
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
};

UserActionForm.displayName = 'UserActionForm';

export default UserActionForm;
