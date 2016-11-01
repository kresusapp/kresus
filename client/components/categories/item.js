import React from 'react';

import { translate as $t, NONE_CATEGORY_ID, assert } from '../../helpers';

import ConfirmDeleteModal from '../ui/confirm-delete-modal';
import ColorPicker from '../ui/color-picker';

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
        this.handleDelete = this.handleDelete.bind(this);
    }

    isEditing() {
        return (typeof this.props.cat.id !== 'undefined');
    }

    isCreating() {
        return !this.isEditing();
    }

    handleKeyUp(e) {
        if (e.key === 'Enter') {
            return this.handleSave(e);
        } else if (e.key === 'Escape') {
            if (this.isEditing()) {
                this.refs.title.value = this.props.cat.title;
            } else {
                this.props.onCancelCreation(e);
            }
        }
        return true;
    }

    handleColorSave(e) {
        if (this.isEditing() || this.refs.title.value.trim().length) {
            this.handleSave(e);
        }
    }

    handleSave(e) {
        let cat = this.props.cat;
        let title = this.refs.title.value.trim();
        let color = this.refs.color.getValue();

        if (!title || !color || ((color === cat.color) && (title === cat.title))) {
            if (this.isCreating()) {
                this.props.onCancelCreation(e);
            } else if (!this.title) {
                this.refs.title.value = this.props.cat.title;
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
            this.refs.title.value = '';
            this.props.onCancelCreation(e);
        }

        if (e) {
            e.preventDefault();
        }
    }

    handleBlur(e) {
        if (this.isEditing()) {
            this.handleSave(e);
        }
    }

    handleDelete(e) {
        if (this.isEditing()) {
            let replaceCategory = this.refs.replacement.value;
            this.props.deleteCategory(this.props.cat, replaceCategory);
        } else {
            this.props.onCancelCreation(e);
        }
    }

    selectTitle() {
        this.refs.title.select();
    }

    render() {
        let c = this.props.cat;

        let replacementOptions = this.props.categories
                                    .filter(cat => cat.id !== c.id)
                                    .map(cat =>
                                        <option
                                          key={ cat.id }
                                          value={ cat.id }>
                                            { cat.title }
                                        </option>);

        replacementOptions = [
            <option key="none" value={ NONE_CATEGORY_ID }>
                { $t('client.category.dont_replace') }
            </option>
        ].concat(replacementOptions);

        let modalBody = (<div>
            <div className="alert alert-info">
                { $t('client.category.erase', { title: c.title }) }
            </div>
            <div>
                <select className="form-control" ref="replacement">
                    { replacementOptions }
                </select>
            </div>
        </div>);

        let deleteButton;

        if (this.isCreating()) {
            deleteButton = (<span
              className="fa fa-times-circle"
              aria-label="remove"
              onClick={ this.handleDelete }
              title={ $t('client.general.delete') }
            />);
        } else {
            deleteButton = (<span
              className="fa fa-times-circle"
              aria-label="remove"
              data-toggle="modal"
              data-target={ `#confirmDeleteCategory${c.id}` }
              title={ $t('client.general.delete') }
            />);
        }

        return (
            <tr key={ c.id }>
                <td>
                    <ColorPicker
                      defaultValue={ c.color }
                      onChange={ this.handleColorSave }
                      ref="color"
                    />
                </td>
                <td>
                    <input
                      type="text" className="form-control"
                      placeholder={ $t('client.category.label') }
                      defaultValue={ c.title }
                      onKeyUp={ this.handleKeyUp }
                      onBlur={ this.handleBlur }
                      ref="title"
                    />
                </td>
                <td>
                    { deleteButton }

                    <ConfirmDeleteModal
                      modalId={ `confirmDeleteCategory${c.id}` }
                      modalBody={ modalBody }
                      onDelete={ this.handleDelete }
                    />
                </td>
            </tr>
        );
    }
}

CategoryListItem.propTypes = {
    // The category related to this item.
    cat: React.PropTypes.object.isRequired,

    // The list of categories.
    categories: React.PropTypes.array.isRequired,

    // The method to create a category.
    createCategory: React.PropTypes.func,

    // The method to update a category.
    updateCategory: React.PropTypes.func,

    // The method to delete a category.
    deleteCategory: React.PropTypes.func,

    // A method to call when the creation of a category is cancelled.
    onCancelCreation: React.PropTypes.func
};

export default CategoryListItem;
