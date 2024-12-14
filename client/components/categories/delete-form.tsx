import React, { useCallback, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import { translate as $t, notify, NONE_CATEGORY_ID } from '../../helpers';
import { useKresusDispatch, useKresusState } from '../../store';
import * as CategoriesStore from '../../store/categories';
import * as BanksStore from '../../store/banks';
import URL from './urls';

import { BackLink, Form } from '../ui';

const DeleteForm = () => {
    const { categoryId: categoryStringId } = useParams<{ categoryId: string }>();
    const categoryId = Number.parseInt(categoryStringId, 10);

    const category = useKresusState(state => CategoriesStore.fromId(state.categories, categoryId));
    const categories = useKresusState(state => CategoriesStore.all(state.categories));
    const numTransactions = useKresusState(
        state => BanksStore.transactionIdsByCategoryId(state.banks, categoryId).length
    );

    const history = useHistory();
    const dispatch = useKresusDispatch();

    const refReplace = useRef<HTMLSelectElement>(null);

    const deleteCategory = useCallback(async () => {
        // The "replacement" select isn't even mounted if the category is unused.
        const replaceBy = refReplace.current ? +refReplace.current.value : NONE_CATEGORY_ID;

        // A bit of caution is needed here: if we first erase without moving
        // back to the categories list, then React will re-render this
        // component, but the call to getCategoryById above will fail, because
        // the category may not exist anymore!
        // So, we have to first push the history entry, then delete, and get
        // back to the current form if the deletion failed somehow.
        history.push(URL.list);
        try {
            await dispatch(
                CategoriesStore.destroy({ id: categoryId, replaceById: replaceBy })
            ).unwrap();
            notify.success($t('client.category.deletion_success'));
        } catch (error) {
            notify.error($t('client.category.deletion_error', { error: error.message }));
            history.push(URL.delete(categoryId));
        }
    }, [dispatch, history, refReplace, categoryId]);

    let explainer;
    let replaceForm;
    if (numTransactions > 0) {
        explainer = $t('client.category.attached_transactions', {
            // eslint-disable-next-line camelcase
            smart_count: numTransactions,
        });

        // Filter out the current category and none, since NONE is the default
        // and preselected by default.
        const options = categories
            .filter(cat => cat.id !== categoryId && cat.id !== NONE_CATEGORY_ID)
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

            <h3>{$t('client.category.delete_title', { label: category.label })}</h3>
            <p>
                <strong>{explainer}</strong>
            </p>

            {replaceForm}

            <button className="btn danger" onClick={deleteCategory}>
                {$t('client.general.delete')}
            </button>
        </Form>
    );
};

export default DeleteForm;
