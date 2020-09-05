import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { generateColor, translate as $t, assert, NONE_CATEGORY_ID } from '../../helpers';
import { get, actions } from '../../store';

import ColorPicker from '../ui/color-picker';
import { Popform } from '../ui';

let DeleteCategoryForm = connect((state, props) => {
    let categories = get.categories(state);
    let numTransactions = get.operationIdsByCategoryId(state, props.category.id).length;
    return {
        categories,
        numTransactions,
    };
})(props => {
    let replacement;

    let refReplacementCatSelector = node => {
        replacement = node;
    };

    let deleteCategory = () => {
        // The "replacement" select isn't even mounted if the category is unused.
        let replaceBy = replacement ? +replacement.value : NONE_CATEGORY_ID;
        props.deleteCategory(props.category.id, replaceBy);
    };

    let content = null;
    if (props.numTransactions > 0) {
        let replacementOptions = props.categories
            .filter(cat => cat.id !== props.category.id)
            .map(cat => (
                <option key={cat.id} value={cat.id}>
                    {cat.label}
                </option>
            ));

        content = (
            <>
                <p className="alerts info">
                    {$t('client.category.attached_transactions', {
                        // eslint-disable-next-line camelcase
                        smart_count: props.numTransactions,
                    })}
                    <br />
                    {$t('client.category.replace_with_info')}
                    <br />
                    {$t('client.category.budget_migration')}
                </p>
                <p className="cols-with-label">
                    <label> {$t('client.category.replace_with')}</label>
                    <select className="form-element-block" ref={refReplacementCatSelector}>
                        <option key="none" value={NONE_CATEGORY_ID}>
                            {$t('client.category.dont_replace')}
                        </option>
                        {replacementOptions}
                    </select>
                </p>
            </>
        );
    } else {
        content = <p className="alerts info">{$t('client.category.no_transactions_attached')}</p>;
    }

    return (
        <Popform
            trigger={
                <button
                    className="fa fa-times-circle"
                    aria-label="remove category"
                    title={$t('client.general.delete')}
                />
            }
            onConfirm={deleteCategory}
            confirmClass="danger">
            <h3>{$t('client.confirmdeletemodal.title')}</h3>
            {content}
            <p>{$t('client.category.erase', { label: props.category.label })}</p>
        </Popform>
    );
});

const CategoryListItem = connect(
    null,
    dispatch => {
        return {
            handleDelete(catId, replaceByCatId) {
                actions.deleteCategory(dispatch, catId, replaceByCatId);
            },
        };
    },
    null,
    { forwardRef: true }
)(
    class extends React.Component {
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
                color,
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
                    color: newColor,
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
                color,
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
                deleteButton = (
                    <DeleteCategoryForm
                        category={editedCategory}
                        deleteCategory={this.props.handleDelete}
                    />
                );
            }

            return (
                <tr key={editedCategory.id}>
                    <td>
                        <ColorPicker
                            defaultValue={this.state.color}
                            onChange={this.handleColorSave}
                        />
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
);

CategoryListItem.propTypes = {
    // The category related to this item.
    cat: PropTypes.object.isRequired,

    // The method to create a category.
    createCategory: PropTypes.func,

    // The method to update a category.
    updateCategory: PropTypes.func,

    // A method to call when the creation of a category is cancelled.
    onCancelCreation: PropTypes.func,
};

export default CategoryListItem;
