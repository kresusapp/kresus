import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t, NONE_CATEGORY_ID } from '../../helpers';
import { get, actions } from '../../store';

import { registerModal } from '../ui/new-modal';

const MODAL_SLUG = 'confirm-delete-category';

const Body = connect(
    state => {
        let { categoryId } = get.modal(state).state;
        let { title } = categoryId ? get.categoryById(state, categoryId) : null;
        return {
            categoryId,
            title,
            categories: get.categoriesButNone(state)
        };
    },
    dispatch => ({ dispatch }),
    (stateToProps, { dispatch }) => {
        return {
            ...stateToProps,
            onChangeCategory(event) {
                actions.showModal(dispatch, MODAL_SLUG, {
                    categoryId: stateToProps.categoryId,
                    selectedCat: event.target.value
                });
            }
        };
    }
)(props => {
    let replacementOptions = props.categories
        .filter(cat => cat.id !== props.categoryId)
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
    return (
        <div>
            <div className="alert alert-info">
                {$t('client.category.erase', { title: props.title })}
            </div>
            <div>
                <select className="form-control" onChange={props.onChangeCategory}>
                    {replacementOptions}
                </select>
            </div>
        </div>
    );
});

const Footer = connect(
    state => {
        return {
            ...get.modal(state).state
        };
    },
    dispatch => ({ dispatch }),
    ({ categoryId, selectedCat }, { dispatch }) => {
        return {
            handleCancel() {
                actions.hideModal(dispatch);
            },
            handleDelete() {
                actions.deleteCategory(dispatch, categoryId, selectedCat);
            }
        };
    }
)(props => {
    return (
        <div>
            <button type="button" className="btn btn-default" onClick={props.handleCancel}>
                {$t('client.confirmdeletemodal.dont_delete')}
            </button>
            <button type="button" className="btn btn-danger" onClick={props.handleDelete}>
                {$t('client.confirmdeletemodal.confirm')}
            </button>
        </div>
    );
});

registerModal(MODAL_SLUG, () => {
    return {
        title: $t('client.confirmdeletemodal.title'),
        body: <Body />,
        footer: <Footer />
    };
});

const DeleteCategoryButton = connect(null, (dispatch, props) => {
    return {
        handleDelete() {
            actions.showModal(dispatch, MODAL_SLUG, {
                categoryId: props.categoryId,
                selectedCat: NONE_CATEGORY_ID
            });
        }
    };
})(props => {
    return (
        <span
            className="fa fa-times-circle"
            aria-label="remove"
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
