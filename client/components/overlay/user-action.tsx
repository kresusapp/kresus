import { useCallback, useEffect, useRef, useState } from 'react';
import { translate as $t, notify } from '../../helpers';
import type * as UiStore from '../../store/ui';

import { Form, ValidatedTextInput } from '../ui';
import DisplayIf from '../ui/display-if';
import type { ValidatedTextInputRef } from '../ui/validated-text-input';

const UserActionForm = (props: { action: UiStore.UserActionRequested }) => {
    const [formFields, setFormFields] = useState({});

    const onSubmit = useCallback(async () => {
        try {
            props.action.finish(formFields);
        } catch (err) {
            notify.error(`error when entering 2nd factor: ${err.message}`);
        }
    }, [props.action, formFields]);

    const refFirstInput = useRef<ValidatedTextInputRef>(null);

    // Focus on the first input field, if there's one.
    useEffect(() => {
        refFirstInput?.current?.focus();
    }, []);

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

        const fieldId = `field-${field.id}`;

        return (
            <Form.Input
                key={fieldId}
                label={field.label || $t('client.user-action.code')}
                id={fieldId}
            >
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
            {fieldForms}

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
