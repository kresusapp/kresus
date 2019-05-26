import React from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../store';

import { translate as $t } from '../../helpers';

import CategoryListItem from './item';
import { MODAL_SLUG as DELETE_UNUSED_MODAL_SLUG } from './delete-unused-modal';
import DisplayIf from '../ui/display-if';

class CategoryList extends React.Component {
    state = {
        showForm: false
    };

    refNewCategory = React.createRef();

    handleAddDefault = () => {
        this.props.createDefaultCategories();
    };

    handleShowForm = e => {
        e.preventDefault();

        this.setState(
            {
                showForm: !this.state.showForm
            },
            function() {
                // then
                if (this.state.showForm) {
                    this.refNewCategory.current.selectLabel();
                }
            }
        );
    };

    render = () => {
        let items = this.props.categories.map(cat => (
            <CategoryListItem
                cat={cat}
                categories={this.props.categories}
                updateCategory={this.props.updateCategory}
                deleteCategory={this.props.deleteCategory}
                key={cat.id}
            />
        ));

        let addButtonType = 'plus';
        let addButtonAria = 'add';
        let addButtonLabel = 'client.category.add';
        if (this.state.showForm) {
            addButtonType = 'minus';
            addButtonAria = 'cancel';
            addButtonLabel = 'client.general.cancel';
        }

        let numUnusedCategories = this.props.unusedCategories.length;
        let deleteUnusedButtonLabel;
        if (numUnusedCategories === 0) {
            deleteUnusedButtonLabel = $t('client.category.no_unused_categories');
        } else {
            deleteUnusedButtonLabel = $t('client.category.delete_unused', {
                // eslint-disable-next-line camelcase
                smart_count: numUnusedCategories
            });
        }

        return (
            <div className="categories">
                <p className="actions">
                    <button
                        className="btn"
                        aria-label={addButtonAria}
                        onClick={this.handleShowForm}>
                        <span className={`fa fa-${addButtonType}-circle`} />
                        <span>{$t(addButtonLabel)}</span>
                    </button>

                    <button
                        className="btn"
                        aria-label="add default"
                        onClick={this.handleAddDefault}>
                        <span className={'fa fa-plus-circle'} />
                        <span>{$t('client.category.add_default')}</span>
                    </button>

                    <button
                        className="btn danger"
                        aria-label="delete unused"
                        onClick={this.props.handleShowDeleteUnusedModal}
                        disabled={numUnusedCategories === 0}>
                        <span className={'fa fa-trash'} />
                        <span>{deleteUnusedButtonLabel}</span>
                    </button>
                </p>

                <table className="striped">
                    <thead>
                        <tr>
                            <th className="category-color">
                                {$t('client.category.column_category_color')}
                            </th>
                            <th>{$t('client.category.column_category_name')}</th>

                            <th className="category-action">
                                {$t('client.category.column_action')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <DisplayIf condition={this.state.showForm}>
                            <CategoryListItem
                                cat={{}}
                                categories={this.props.categories}
                                createCategory={this.props.createCategory}
                                onCancelCreation={this.handleShowForm}
                                ref={this.refNewCategory}
                            />
                        </DisplayIf>
                        {items}
                    </tbody>
                </table>
            </div>
        );
    };
}

const Export = connect(
    state => {
        return {
            categories: get.categoriesButNone(state),
            unusedCategories: get.unusedCategories(state)
        };
    },

    dispatch => {
        return {
            createCategory(category) {
                actions.createCategory(dispatch, category);
            },

            createDefaultCategories: () => actions.createDefaultCategories(dispatch),

            updateCategory(former, newer) {
                actions.updateCategory(dispatch, former, newer);
            },

            showDeleteUnusedModal(unusedCategories) {
                actions.showModal(dispatch, DELETE_UNUSED_MODAL_SLUG, unusedCategories);
            }
        };
    },

    (state, dispatch) => {
        let { showDeleteUnusedModal, ...otherDispatch } = dispatch;
        return {
            ...state,
            ...otherDispatch,
            handleShowDeleteUnusedModal() {
                showDeleteUnusedModal(state.unusedCategories);
            }
        };
    }
)(CategoryList);

export default Export;
