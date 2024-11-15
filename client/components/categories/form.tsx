import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { useKresusDispatch, useKresusState } from '../../store';
import * as CategoriesStore from '../../store/categories';
import { translate as $t, generateColor, notify, assertNotNull } from '../../helpers';
import { ColorPicker, Form, BackLink, ValidatedTextInput } from '../ui';

import URL from './urls';
import { ValidatedTextInputRef } from '../ui/validated-text-input';

const CategoryForm = (props: { id?: number }) => {
    const dispatch = useKresusDispatch();
    const history = useHistory();

    const labelRef = useRef<ValidatedTextInputRef>(null);

    const category = useKresusState(state => {
        if (props.id) {
            // Edition mode.
            return CategoriesStore.fromId(state.categories, props.id);
        }
        // Creation mode.
        return null;
    });

    const initialLabel = category ? category.label : null;
    const initialColor = category ? category.color : generateColor();
    const header = category ? $t('client.category.edition') : $t('client.category.creation');

    const [label, setLabel] = useState(initialLabel);
    const [color, setColor] = useState(initialColor);

    const submit = useCallback(async () => {
        assertNotNull(label);
        const newFields = {
            label,
            color,
        };

        if (category === null) {
            // Creation mode.
            try {
                await dispatch(CategoriesStore.create(newFields)).unwrap();
                notify.success($t('client.category.creation_success'));
                history.push(URL.list);
            } catch (error) {
                notify.error($t('client.category.creation_error', { error: error.message }));
            }
            return;
        }

        try {
            await dispatch(
                CategoriesStore.update({ former: category, category: newFields })
            ).unwrap();
            notify.success($t('client.category.edition_success'));
            history.push(URL.list);
        } catch (error) {
            notify.error($t('client.category.edition_error', { error: error.message }));
        }
    }, [history, dispatch, label, color, category]);

    // On mount, focus on (resp. select in edit mode) the label field.
    useEffect(() => {
        if (labelRef.current) {
            if (category) {
                labelRef.current.select();
            } else {
                labelRef.current.focus();
            }
        }
    }, [category]);

    const submitDisabled = !label || label.length === 0;

    return (
        <Form center={true} onSubmit={submit}>
            <BackLink to={URL.list}>{$t('client.general.cancel')}</BackLink>

            <h3>{header}</h3>

            <Form.Input label={$t('client.category.name')} id="title">
                <ValidatedTextInput ref={labelRef} onChange={setLabel} initialValue={label} />
            </Form.Input>

            <Form.Input label={$t('client.category.color')} id="color">
                <ColorPicker onChange={setColor} defaultValue={color} />
            </Form.Input>

            <input
                type="submit"
                className="btn primary"
                value={$t('client.general.save')}
                disabled={submitDisabled}
            />
        </Form>
    );
};

const EditForm = () => {
    const { categoryId: categoryIdStr } = useParams<{ categoryId: string }>();
    const categoryId = Number.parseInt(categoryIdStr, 10);
    return <CategoryForm id={categoryId} />;
};

const NewForm = CategoryForm;

export { EditForm, NewForm };
