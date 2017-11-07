import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t, NONE_CATEGORY_ID } from '../../helpers';
import { get, actions } from '../../store';

import { registerModal } from '../ui/new-modal';
import ModalContent from '../ui/new-modal/content';
import CancelAndDelete from '../ui/new-modal/cancel-and-delete-buttons';

const MODAL_SLUG = 'confirm-delete-category';

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
            handleDelete(catId, replacementCatId) {
                actions.deleteCategory(dispatch, catId, replacementCatId);
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
                    footer={<CancelAndDelete onClickDelete={this.handleDelete} />}
                />
            );
        }
    }
);

registerModal(MODAL_SLUG, () => <ConfirmDeleteModal />);

const DeleteCategoryButton = connect(
    null,
    (dispatch, props) => {
        return {
            handleDelete() {
                actions.showModal(dispatch, MODAL_SLUG, props.categoryId);
            }
        };
    }
)(props => {
    return (
        <button
            className="fa fa-times-circle"
            aria-label="remove category"
            onClick={props.handleDelete}
            title={$t('client.general.delete')}
        />
    );
});

DeleteCategoryButton.propTypes = {
    // The category's unique id
    categoryId: PropTypes.string.isRequired
};

export default DeleteCategoryButton;
