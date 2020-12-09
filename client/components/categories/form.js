import React, { useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { connect } from 'react-redux';

import { get, actions } from '../../store';
import { translate as $t, generateColor, notify } from '../../helpers';
import { ColorPicker, Form, BackLink, ValidatedTextInput } from '../ui';

import URL from './urls';

const CategoryForm = connect(
    (state, props) => {
        if (props.id) {
            // Edition mode
            return { category: get.categoryById(state, props.id) };
        }
        return {};
    },
    dispatch => {
        return {
            async create(category, history) {
                try {
                    await actions.createCategory(dispatch, category);
                    notify.success($t('client.category.creation_success'));
                    history.push(URL.list);
                } catch (error) {
                    notify.error($t('client.category.creation_error', { error: error.message }));
                }
            },

            async edit(former, newFields, history) {
                try {
                    await actions.updateCategory(dispatch, former, newFields);
                    notify.success($t('client.category.edition_success'));
                    history.push(URL.list);
                } catch (error) {
                    notify.error($t('client.category.edition_error', { error: error.message }));
                }
            },
        };
    },
    (stateProps, dispatchProps) => {
        if (stateProps.category) {
            // Edition mode.
            return {
                async submit(newCategory, history) {
                    await dispatchProps.edit(stateProps.category, newCategory, history);
                },
                ...stateProps,
            };
        }

        // Creation mode.
        return {
            submit: dispatchProps.create,
        };
    }
)(props => {
    let labelRef = useRef(null);

    let initialLabel = props.category ? props.category.label : null;
    let initialColor = props.category ? props.category.color : generateColor();
    let header = props.category ? $t('client.category.edition') : $t('client.category.creation');

    let [label, setLabel] = useState(initialLabel);
    let [color, setColor] = useState(initialColor);

    // On mount, focus on (resp. select in edit mode) the label field.
    useEffect(() => {
        if (labelRef.current) {
            if (props.category) {
                labelRef.current.select();
            } else {
                labelRef.current.focus();
            }
        }
    }, [props]);

    let history = useHistory();

    let submit = async () => {
        await props.submit({ label, color }, history);
    };

    let submitDisabled = !label || label.length === 0;

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
});

const EditForm = () => {
    let { categoryId } = useParams();
    return <CategoryForm id={categoryId} />;
};

const NewForm = CategoryForm;

export { EditForm, NewForm };
