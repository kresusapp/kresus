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
        let title = category ? category.title : null;
        let attachedOptsQty = get.operationIdsByCategoryId(state, categoryId).length;
        return {
            categoryId,
            title,
            attachedOptsQty,
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
            this.props.handleDelete(this.props.categoryId, this.replacement.value);
        };

        render() {
            let noAttachedOps = null;
            let replacement = null;

            if (this.props.attachedOptsQty > 0) {
                let replacementOptions = this.props.categories
                    .filter(cat => cat.id !== this.props.categoryId)
                    .map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.title}
                        </option>
                    ));

                replacement = (
                    <React.Fragment>
                        <p className="kalerts info">
                            {$t('client.category.attached_transactions', {
                                opsQty: this.props.attachedOptsQty
                            })}
                            <br />
                            {$t('client.category.replace_with_info')}
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
                noAttachedOps = (
                    <p className="kalerts info">{$t('client.category.no_transactions_attached')}</p>
                );
            }

            const body = (
                <React.Fragment>
                    {noAttachedOps}
                    {replacement}
                    <p>{$t('client.category.erase', { title: this.props.title })}</p>
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
