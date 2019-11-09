import React from 'react';
import { connect } from 'react-redux';

import { translate as $t, NONE_CATEGORY_ID } from '../../helpers';
import { get, actions } from '../../store';

import { registerModal } from '../ui/modal';
import ModalContent from '../ui/modal/content';
import CancelAndDelete from '../ui/modal/cancel-and-delete-buttons';

const DeleteUnusedCategoriesModal = connect(
    state => {
        return {
            categories: get.modal(state).state
        };
    },

    dispatch => {
        return {
            deleteCategory(id) {
                actions.deleteCategory(dispatch, id, NONE_CATEGORY_ID);
            }
        };
    },

    (state, dispatch) => {
        let { deleteCategory, ...otherDispatch } = dispatch;
        return {
            ...state,
            ...otherDispatch,
            handleDelete() {
                for (let { id } of state.categories) {
                    deleteCategory(id);
                }
            }
        };
    }
)(props => {
    let listItems = props.categories.map(c => <li key={c.id}>{c.label}</li>);

    const body = (
        <React.Fragment>
            <p>{$t('client.deleteunusedcategoriesmodal.explanation')}</p>
            <ul>{listItems}</ul>
            <p>{$t('client.deleteunusedcategoriesmodal.question')}</p>
        </React.Fragment>
    );

    return (
        <ModalContent
            title={$t('client.deleteunusedcategoriesmodal.title')}
            body={body}
            footer={<CancelAndDelete onDelete={props.handleDelete} />}
        />
    );
});

export const MODAL_SLUG = 'delete-unused-categories';

registerModal(MODAL_SLUG, () => <DeleteUnusedCategoriesModal />);
