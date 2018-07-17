import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { translate as $t, assert } from '../../helpers';
import { actions } from '../../store';

import ColorPicker from '../ui/color-picker';
import { MODAL_SLUG } from './confirm-delete-modal';

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

class CategoryListItem extends React.Component {
    constructor(props) {
        super(props);

        if (this.isCreating()) {
            assert(this.props.createCategory instanceof Function);
            assert(this.props.onCancelCreation instanceof Function);
        } else {
            assert(this.props.updateCategory instanceof Function);
            assert(this.props.deleteCategory instanceof Function);
        }

        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleColorSave = this.handleColorSave.bind(this);

        this.colorInput = null;
        this.titleInput = null;
        this.replacementSelector = null;
    }

    isEditing() {
        return typeof this.props.cat.id !== 'undefined';
    }

    isCreating() {
        return !this.isEditing();
    }

    handleKeyUp(e) {
        if (e.key === 'Enter') {
            return this.handleSave(e);
        } else if (e.key === 'Escape') {
            if (this.isEditing()) {
                e.target.value = this.props.cat.title;
            } else {
                this.props.onCancelCreation(e);
            }
        }
        return true;
    }

    handleColorSave(e) {
        if (this.isEditing() || this.titleInput.value.trim().length) {
            this.handleSave(e);
        }
    }

    handleSave(e) {
        let cat = this.props.cat;
        let title = this.titleInput.value.trim();
        let color = this.colorInput.getValue();

        if (!title || !color || (color === cat.color && title === cat.title)) {
            if (this.isCreating()) {
                this.props.onCancelCreation(e);
            } else if (!this.title) {
                this.titleInput.value = this.props.cat.title;
            }

            return false;
        }

        let category = {
            title,
            color
        };

        if (this.isEditing()) {
            this.props.updateCategory(cat, category);
        } else {
            this.props.createCategory(category);
            this.titleInput.value = '';
            this.props.onCancelCreation(e);
        }

        if (e && e instanceof Event) {
            e.preventDefault();
        }
    }

    handleBlur(e) {
        if (this.isEditing()) {
            this.handleSave(e);
        }
    }

    selectTitle() {
        this.titleInput.select();
    }

    render() {
        let c = this.props.cat;

        let deleteButton;

        if (this.isCreating()) {
            deleteButton = (
                <span
                    className="fa fa-times-circle"
                    aria-label="remove"
                    onClick={this.props.onCancelCreation}
                    title={$t('client.general.delete')}
                />
            );
        } else {
            deleteButton = <DeleteCategoryButton categoryId={c.id} />;
        }

        let refColorInput = input => {
            this.colorInput = input;
        };
        let refTitleInput = input => {
            this.titleInput = input;
        };

        return (
            <tr key={c.id}>
                <td>
                    <ColorPicker
                        defaultValue={c.color}
                        onChange={this.handleColorSave}
                        ref={refColorInput}
                    />
                </td>
                <td>
                    <input
                        type="text"
                        className="form-element-block"
                        placeholder={$t('client.category.label')}
                        defaultValue={c.title}
                        onKeyUp={this.handleKeyUp}
                        onBlur={this.handleBlur}
                        ref={refTitleInput}
                    />
                </td>
                <td>{deleteButton}</td>
            </tr>
        );
    }
}

CategoryListItem.propTypes = {
    // The category related to this item.
    cat: PropTypes.object.isRequired,

    // The method to create a category.
    createCategory: PropTypes.func,

    // The method to update a category.
    updateCategory: PropTypes.func,

    // A method to call when the creation of a category is cancelled.
    onCancelCreation: PropTypes.func
};

export default CategoryListItem;
