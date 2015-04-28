// Constants
import {translate as t, NONE_CATEGORY_ID} from '../Helpers';

// Global variables
import {Actions, store, State} from '../store';

import ConfirmDeleteModal from './ConfirmDeleteModal';
import T from './Translated';

function CreateForm(onSave, onCancel, previousValue) {

    function onKeyUp(e) {
        if (e.keyCode == 13) {
            return onSave(e);
        }
        return true;
    }

    return (
        <tr>
            <td>
                <input type="text" className="form-control"
                  placeholder={t('category.label') || 'Label'}
                  defaultValue={previousValue || ''} onKeyUp={onKeyUp}
                  ref="label" />
            </td>
            <td>
                <div className="btn-group btn-group-justified" role="group">
                    <a className="btn btn-success" role="button" onClick={onSave}>
                        <T k='general.save'>save</T>
                    </a>
                    <a className="btn btn-danger" role="button" onClick={onCancel}>
                        <T k='general.cancel'>cancel</T>
                    </a>
                </div>
            </td>
        </tr>);
}

class CategoryListItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            editMode: false
        }
    }

    onSaveEdit(e) {
        var label = this.refs.label.getDOMNode().value.trim();
        if (!label)
            return false;

        var category = {
            title: label
        };

        Actions.UpdateCategory(this.props.cat, category);

        this.setState({
            editMode: false
        });
        e.preventDefault();
    }

    onCancelEdit(e) {
        this.setState({
            editMode: false
        });
        e.preventDefault();
    }

    onShowEdit(e) {
        this.setState({
            editMode: true
        }, function() {
            // then
            this.refs.label.getDOMNode().select();
        });
        e.preventDefault();
    }

    onDelete() {
        let replaceCategory = this.refs.replacement.getDOMNode().value;
        Actions.DeleteCategory(this.props.cat, replaceCategory);
    }

    render() {

        if (this.state.editMode)
            return CreateForm(this.onSaveEdit.bind(this), this.onCancelEdit.bind(this), this.props.cat.title);

        var c = this.props.cat;

        var replacementOptions = store.getCategories().filter(function(cat) {
            return cat.id !== c.id &&
                   cat.id !== NONE_CATEGORY_ID;
        }).map(function(cat) {
            return <option key={cat.id} value={cat.id}>{cat.title}</option>
        });
        replacementOptions = [
            <option key='none' value={NONE_CATEGORY_ID}>
                <T k='category.dont_replace'>Don't replace</T>
            </option>
        ].concat(replacementOptions);

        var modalBody = <div>
            <div className="alert alert-info">
                <T k='category.erase' cx={{title: c.title}}>
                This will erase the "{c.title}" category. If there are transactions mapped to this category, and you would like to move them to an existing category, you can do so in this list (by default, all transactions will move to the "None" category). Are you sure about this?
                </T>
            </div>
            <div>
                <select className="form-control" ref="replacement">
                    {replacementOptions}
                </select>
            </div>
        </div>;

        return (
            <tr key={c.id}>
                <td>{c.title}</td>
                <td>
                    <div className="btn-group btn-group-justified" role="group">
                        <a className="btn btn-primary" role="button" onClick={this.onShowEdit.bind(this)}>
                            <T k='general.edit'>edit</T>
                        </a>
                        <a className="btn btn-danger" role="button" data-toggle="modal"
                          data-target={'#confirmDeleteCategory' + c.id}>
                          <T k='general.delete'>delete</T>
                        </a>
                    </div>

                    <ConfirmDeleteModal
                        modalId={'confirmDeleteCategory' + c.id}
                        modalBody={modalBody}
                        onDelete={this.onDelete.bind(this)}
                    />
                </td>
            </tr>
        );
    }
}

export default class CategoryList extends React.Component {

    constructor() {
        this.state = {
            showForm: false,
            categories: []
        }
        this.listener = this._listener.bind(this);
    }

    _listener() {
        this.setState({
            categories: store.getCategories()
        });
    }

    componentDidMount() {
        store.subscribeMaybeGet(State.categories, this.listener);
    }

    componentWillUnmount() {
        store.removeListener(State.categories, this.listener);
    }

    onShowForm(e) {
        e.preventDefault();
        this.setState({
            showForm: !this.state.showForm
        }, function() {
            // then
            if (this.state.showForm)
                this.refs.label.getDOMNode().select();
        });
    }

    onSave(e) {
        e.preventDefault();

        var label = this.refs.label.getDOMNode().value.trim();
        if (!label)
            return false;

        var category = {
            title: label
        };

        Actions.CreateCategory(category);

        this.refs.label.getDOMNode().value = '';
        this.setState({
            showForm: false
        });
        return false;
    }

    render() {
        var items = this.state.categories
            .filter((cat) => cat.id != NONE_CATEGORY_ID)
            .map((cat) => <CategoryListItem cat={cat} key={cat.id} />);

        var maybeForm = this.state.showForm ? CreateForm(this.onSave.bind(this), this.onShowForm.bind(this))
                                            : <tr/>;

        return (
        <div>
            <div className="top-panel panel panel-default">
                <div className="panel-heading">
                    <h3 className="title panel-title">
                        <T k='category.title'>Categories</T>
                    </h3>
                </div>

                <div className="panel-body">
                    <a className="btn btn-primary text-uppercase pull-right" href="#" onClick={this.onShowForm.bind(this)}>
                        <T k='category.add'>add a category</T>
                        <strong>+</strong>
                    </a>
                </div>

                <table className="table table-striped table-hover table-bordered">
                    <thead>
                        <tr>
                            <th className="col-sm-10">
                                <T k='category.column_category_name'>CATEGORY NAME</T>
                            </th>
                            <th className="col-sm-2">
                                <T k='category.column_action'>ACTION</T>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {maybeForm}
                        {items}
                    </tbody>
                </table>
            </div>
        </div>);
    }
}

