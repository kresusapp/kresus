import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { translate as $t, assertNotNull, generateColor, notify } from '../../helpers';
import { useRequiredParams } from '../../hooks';
import { useKresusDispatch, useKresusState } from '../../store';
import * as CategoriesStore from '../../store/categories';
import { BackLink, ColorPicker, Form, ValidatedTextInput } from '../ui';
import type { ValidatedTextInputRef } from '../ui/validated-text-input';
import URL from './urls';
import type { Category } from '../../models';

const CategoryForm = (props: { category?: Category }) => {
    const dispatch = useKresusDispatch();
    const navigate = useNavigate();

    const labelRef = useRef<ValidatedTextInputRef>(null);

    const { category } = props;
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

        if (typeof category === 'undefined') {
            // Creation mode.
            try {
                await dispatch(CategoriesStore.create(newFields)).unwrap();
                notify.success($t('client.category.creation_success'));
                navigate(URL.list);
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
            navigate(URL.list);
        } catch (error) {
            notify.error($t('client.category.edition_error', { error: error.message }));
        }
    }, [navigate, dispatch, label, color, category]);

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
    const { categoryId: categoryIdStr } = useRequiredParams<{ categoryId: string }>();
    const categoryId = Number.parseInt(categoryIdStr, 10);

    const category = useKresusState(state => {
        return CategoriesStore.fromId(state.categories, categoryId);
    });

    if (!category) {
        return <Navigate to={URL.list} />;
    }

    return <CategoryForm category={category} />;
};

const NewForm = CategoryForm;

export { EditForm, NewForm };
