import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { generateColor, translate as $t, assert } from '../../helpers';
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

        let color;
        if (this.isCreating()) {
            assert(this.props.createCategory instanceof Function);
            assert(this.props.onCancelCreation instanceof Function);
            color = generateColor();
        } else {
            assert(this.props.updateCategory instanceof Function);
            color = this.props.cat.color;
        }

        this.state = {
            color
        };
    }

    refLabel = React.createRef();

    isEditing() {
        return typeof this.props.cat.id !== 'undefined';
    }
    isCreating() {
        return !this.isEditing();
    }

    handleKeyUp = e => {
        if (e.key === 'Enter') {
            return this.handleSave(e);
        } else if (e.key === 'Escape') {
            if (this.isEditing()) {
                e.target.value = this.props.cat.label;
            } else {
                this.props.onCancelCreation(e);
            }
        }
        return true;
    };

    handleColorSave = newColor => {
        this.setState(
            {
                color: newColor
            },
            () => {
                if (this.isEditing()) {
                    this.handleSave();
                }
            }
        );
    };

    handleSave = e => {
        // This might be an empty object when we're creating a new category.
        let editedCategory = this.props.cat;

        let label = this.refLabel.current.value.trim();
        let color = this.state.color;

        if (
            !label ||
            !color ||
            (color === editedCategory.color && label === editedCategory.label)
        ) {
            if (this.isCreating()) {
                this.props.onCancelCreation(e);
            } else if (!this.label) {
                this.refLabel.current.value = editedCategory.label;
            }
            return false;
        }

        let newFields = {
            label,
            color
        };

        if (this.isEditing()) {
            this.props.updateCategory(editedCategory, newFields);
        } else {
            this.props.createCategory(newFields);
            this.refLabel.current.value = '';
            this.props.onCancelCreation(e);
        }

        if (e && e instanceof Event) {
            e.preventDefault();
        }
    };

    handleBlur = e => {
        if (this.isEditing()) {
            this.handleSave(e);
        }
    };

    selectLabel() {
        this.refLabel.current.select();
    }

    render() {
        // This might be an empty object when we're creating a new category.
        let editedCategory = this.props.cat;

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
            deleteButton = <DeleteCategoryButton categoryId={editedCategory.id} />;
        }

        return (
            <tr key={editedCategory.id}>
                <td>
                    <ColorPicker defaultValue={this.state.color} onChange={this.handleColorSave} />
                </td>
                <td>
                    <input
                        type="text"
                        className="form-element-block"
                        placeholder={$t('client.category.label')}
                        defaultValue={editedCategory.label}
                        onKeyUp={this.handleKeyUp}
                        onBlur={this.handleBlur}
                        ref={this.refLabel}
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
