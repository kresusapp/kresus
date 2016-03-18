import React from 'react';

import { Actions, store } from '../../store';
import { translate as $t, NONE_CATEGORY_ID } from '../../helpers';

import CreateForm from './create-form';
import ConfirmDeleteModal from '../ui/confirm-delete-modal';

export default class CategoryListItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            editMode: false
        };

        this.handleSave = this.handleSave.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleShowEdit = this.handleShowEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleSave(e, title, color) {
        let category = {
            title,
            color
        };

        Actions.updateCategory(this.props.cat, category);

        this.setState({
            editMode: false
        });
        e.preventDefault();
    }

    handleCancel(e) {
        this.setState({
            editMode: false
        });
        e.preventDefault();
    }

    handleShowEdit(e) {
        this.setState({
            editMode: true
        }, function() {
            // then
            this.refs.createform.selectLabel();
        });
        e.preventDefault();
    }

    handleDelete() {
        let replaceCategory = this.refs.replacement.value;
        Actions.deleteCategory(this.props.cat, replaceCategory);
    }

    render() {
        let c = this.props.cat;

        if (this.state.editMode) {
            return (
                <CreateForm
                  ref="createform"
                  onSave={ this.handleSave }
                  onCancel={ this.handleCancel }
                  previousColor={ c.color }
                  previousValue={ c.title }
                />);
        }

        let replacementOptions = store.getCategories()
                                    .filter(cat => (cat.id !== c.id && cat.id !== NONE_CATEGORY_ID))
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

        return (
            <tr key={ c.id }>
                <td>
                    <span
                      style={ { backgroundColor: c.color } }
                      className="color_block">
                        &nbsp;
                    </span>
                </td>
                <td>{ c.title }</td>
                <td>
                    <div className="btn-group btn-group-justified" role="group">
                        <a
                          className="btn btn-primary"
                          role="button"
                          onClick={ this.handleShowEdit }>
                            { $t('client.general.edit') }
                        </a>
                        <a className="btn btn-danger" role="button" data-toggle="modal"
                          data-target={ `#confirmDeleteCategory${c.id}` }>
                            { $t('client.general.delete') }
                        </a>
                    </div>

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
