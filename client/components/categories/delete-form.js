import React, { useRef } from 'react';
import { connect } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';

import { translate as $t, notify, NONE_CATEGORY_ID } from '../../helpers';
import { get, actions } from '../../store';
import URL from './urls';

import { BackLink, Form } from '../ui';

const DeleteForm = connect(
    (state, props) => {
        let category = get.categoryById(state, props.categoryId);
        let categories = get.categories(state);
        let numTransactions = get.operationIdsByCategoryId(state, props.categoryId).length;
        return {
            category,
            categories,
            numTransactions,
        };
    },
    dispatch => ({
        async deleteCategory(categoryId, replaceByCategoryId, history) {
            // A bit of caution is needed here: if we first erase without moving
            // back to the categories list, then React will re-render this
            // component, but the call to get.categoryById above will fail, because
            // the category may not exist anymore!
            // So, we have to first push the history entry, then delete, and get
            // back to the current form if the deletion failed somehow.
            history.push(URL.list);
            try {
                await actions.deleteCategory(dispatch, categoryId, replaceByCategoryId);
                notify.success($t('client.category.deletion_success'));
            } catch (error) {
                notify.error($t('client.category.deletion_error', { error: error.message }));
                history.push(URL.delete(categoryId));
            }
        },
    })
)(props => {
    let refReplace = useRef(null);
    let history = useHistory();

    let deleteCategory = async () => {
        // The "replacement" select isn't even mounted if the category is unused.
        let replaceBy = refReplace.current ? +refReplace.current.value : NONE_CATEGORY_ID;
        await props.deleteCategory(props.categoryId, replaceBy, history);
    };

    let explainer;
    let replaceForm;
    if (props.numTransactions > 0) {
        explainer = $t('client.category.attached_transactions', {
            // eslint-disable-next-line camelcase
            smart_count: props.numTransactions,
        });

        // Filter out the current category and none, since NONE is the default
        // and preselected by default.
        let options = props.categories
            .filter(cat => cat.id !== props.categoryId && cat.id !== NONE_CATEGORY_ID)
            .map(cat => (
                <option key={cat.id} value={cat.id}>
                    {cat.label}
                </option>
            ));

        replaceForm = (
            <Form.Input
                inline={true}
                label={$t('client.category.replace_with')}
                id="replace-selector"
                help={$t('client.category.replace_with_info')}>
                <select ref={refReplace}>
                    <option key="none" value={NONE_CATEGORY_ID}>
                        {$t('client.category.dont_replace')}
                    </option>
                    {options}
                </select>
            </Form.Input>
        );
    } else {
        explainer = $t('client.category.no_transactions_attached');
    }

    return (
        <Form center={true}>
            <BackLink to={URL.list}>{$t('client.general.cancel')}</BackLink>

            <h3>{$t('client.category.delete_title', { label: props.category.label })}</h3>
            <p>
                <strong>{explainer}</strong>
            </p>

            {replaceForm}

            <button className="btn danger" onClick={deleteCategory}>
                {$t('client.general.delete')}
            </button>
        </Form>
    );
});

export default () => {
    let { categoryId: categoryStringId } = useParams();
    let categoryId = Number.parseInt(categoryStringId, 10);
    return <DeleteForm categoryId={categoryId} />;
};
