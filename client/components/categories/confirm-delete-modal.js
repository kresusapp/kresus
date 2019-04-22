import React from 'react';
import { connect } from 'react-redux';

import { translate as $t, NONE_CATEGORY_ID } from '../../helpers';
import { get, actions } from '../../store';

import { registerModal } from '../ui/modal';
import ModalContent from '../ui/modal/content';
import CancelAndDelete from '../ui/modal/cancel-and-delete-buttons';

const ConfirmDeleteModal = connect(
    state => {
        let categoryId = get.modal(state).state;
        let category = get.categoryById(state, categoryId);
        let label = category ? category.label : null;
        let numOperations = get.operationIdsByCategoryId(state, categoryId).length;
        return {
            categoryId,
            label,
            numOperations,
            categories: get.categoriesButNone(state)
        };
    },

    dispatch => {
        return {
            handleDelete(catId, replaceByCatId) {
                actions.deleteCategory(dispatch, catId, replaceByCatId);
            }
        };
    }
)(
    class Content extends React.Component {
        refReplacementCatSelector = node => {
            this.replacement = node;
        };

        handleDelete = () => {
            // The "replacement" select isn't even mounted if the category is
            // unused.
            let replaceBy = this.replacement ? this.replacement.value : NONE_CATEGORY_ID;
            this.props.handleDelete(this.props.categoryId, replaceBy);
        };

        render() {
            let content = null;

            if (this.props.numOperations > 0) {
                let replacementOptions = this.props.categories
                    .filter(cat => cat.id !== this.props.categoryId)
                    .map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.label}
                        </option>
                    ));

                content = (
                    <React.Fragment>
                        <p className="alerts info">
                            {$t('client.category.attached_transactions', {
                                // eslint-disable-next-line camelcase
                                smart_count: this.props.numOperations
                            })}
                            <br />
                            {$t('client.category.replace_with_info')}
                            <br />
                            {$t('client.category.budget_migration')}
                        </p>
                        <p className="cols-with-label">
                            <label> {$t('client.category.replace_with')}</label>
                            <select
                                className="form-element-block"
                                ref={this.refReplacementCatSelector}>
                                <option key="none" value={NONE_CATEGORY_ID}>
                                    {$t('client.category.dont_replace')}
                                </option>
                                {replacementOptions}
                            </select>
                        </p>
                    </React.Fragment>
                );
            } else {
                content = (
                    <p className="alerts info">{$t('client.category.no_transactions_attached')}</p>
                );
            }

            const body = (
                <React.Fragment>
                    {content}
                    <p>{$t('client.category.erase', { label: this.props.label })}</p>
                </React.Fragment>
            );

            return (
                <ModalContent
                    title={$t('client.confirmdeletemodal.title')}
                    body={body}
                    footer={<CancelAndDelete onDelete={this.handleDelete} />}
                />
            );
        }
    }
);

export const MODAL_SLUG = 'confirm-delete-category';

registerModal(MODAL_SLUG, () => <ConfirmDeleteModal />);
