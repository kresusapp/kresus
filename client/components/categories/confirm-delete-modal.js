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
        return {
            categoryId,
            title,
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
            let replacementOptions = this.props.categories
                .filter(cat => cat.id !== this.props.categoryId)
                .map(cat => (
                    <option key={cat.id} value={cat.id}>
                        {cat.title}
                    </option>
                ));

            replacementOptions = [
                <option key="none" value={NONE_CATEGORY_ID}>
                    {$t('client.category.dont_replace')}
                </option>
            ].concat(replacementOptions);

            const body = (
                <React.Fragment>
                    <div className="alert alert-info">
                        {$t('client.category.erase', { title: this.props.title })}
                    </div>
                    <div>
                        <select className="form-element-block" ref={this.refReplacementCatSelector}>
                            {replacementOptions}
                        </select>
                    </div>
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
