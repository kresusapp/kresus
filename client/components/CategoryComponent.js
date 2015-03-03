/** @jsx React.DOM */

// Constants
var Events = require('../Events');
var Helpers = require('../Helpers');
var debug = Helpers.debug;
var NONE_CATEGORY_ID = Helpers.NONE_CATEGORY_ID;

// Global variables
var store = require('../store');
var flux = require('../flux/dispatcher');

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
                <input type="text" className="form-control" placeholder='Label'
                  defaultValue={previousValue || ''} onKeyUp={onKeyUp}
                  ref="label" />
            </td>
            <td>
                <div className="btn-group btn-group-justified" role="group">
                    <a className="btn btn-success" role="button" onClick={onSave}>save</a>
                    <a className="btn btn-danger" role="button" onClick={onCancel}>cancel</a>
                </div>
            </td>
        </tr>);
}

var CategoryListItem = React.createClass({

    getInitialState: function() {
        return {
            editMode: false
        }
    },

    _onSaveEdit: function(e) {
        var label = this.refs.label.getDOMNode().value.trim();
        if (!label)
            return false;

        var category = {
            title: label
        };

        flux.dispatch({
            type: Events.user.updated_category,
            id: this.props.cat.id,
            category: category
        });

        this.setState({
            editMode: false
        });
        e.preventDefault();
    },

    _onCancelEdit: function(e) {
        this.setState({
            editMode: false
        });
        e.preventDefault();
    },
    _onShowEdit: function(e) {
        this.setState({
            editMode: true
        }, function() {
            // then
            this.refs.label.getDOMNode().select();
        });
        e.preventDefault();
    },

    _onDelete: function() {
        flux.dispatch({
            type: Events.user.deleted_category,
            id: this.props.cat.id,
            replaceByCategoryId: this.refs.replacement.getDOMNode().value
        });
    },

    render: function() {

        if (this.state.editMode)
            return CreateForm(this._onSaveEdit, this._onCancelEdit, this.props.cat.title);

        var c = this.props.cat;

        var replacementOptions = store.getCategories().filter(function(cat) {
            return cat.id !== c.id &&
                   cat.id !== Helpers.NONE_CATEGORY_ID;
        }).map(function(cat) {
            return <option key={cat.id} value={cat.id}>{cat.title}</option>
        });
        replacementOptions = [<option key='none' value={Helpers.NONE_CATEGORY_ID}>Don't replace</option>].concat(replacementOptions);

        return (
            <tr key={c.id}>
                <td>{c.title}</td>
                <td>
                    <div className="btn-group btn-group-justified" role="group">
                        <a className="btn btn-primary" role="button" onClick={this._onShowEdit}>edit</a>
                        <a className="btn btn-danger" role="button" data-toggle="modal"
                          data-target={'#confirmDeleteCategory' + c.id}>
                            delete
                        </a>
                    </div>

                    <div className="modal fade" id={'confirmDeleteCategory' + c.id} tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                      <div className="modal-dialog">
                        <div className="modal-content">
                          <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 className="modal-title" id="myModalLabel">Confirm deletion</h4>
                          </div>
                          <div className="modal-body">
                            <div className="alert alert-info">
                                This will erase the category "{c.title}". If there are operations which are mapped to this category, and you would like to update
                                their category to an existing one, please
                                choose it in this list (leaving it unmodified will affect all operations to the "None" category).
                            </div>
                            <div>
                                <select className="form-control" ref="replacement">
                                    {replacementOptions}
                                </select>
                            </div>
                          </div>
                          <div className="modal-footer">
                            <button type="button" className="btn btn-default" data-dismiss="modal">Don't delete</button>
                            <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={this._onDelete}>Confirm deletion</button>
                          </div>
                        </div>
                      </div>
                    </div>
                </td>
            </tr>
        );
    }
});

module.exports = React.createClass({

    _listener: function() {
        this.setState({
            categories: store.getCategories()
        });
    },

    getInitialState: function() {
        return {
            showForm: false,
            categories: []
        }
    },

    componentDidMount: function() {
        store.subscribeMaybeGet(Events.state.categories, this._listener);
    },

    componentWillUnmount: function() {
        store.removeListener(Events.state.categories, this._listener);
    },

    _onShowForm: function(e) {
        e.preventDefault();
        this.setState({
            showForm: !this.state.showForm
        }, function() {
            // then
            if (this.state.showForm)
                this.refs.label.getDOMNode().select();
        });
    },

    _onSave: function(e) {
        e.preventDefault();

        var label = this.refs.label.getDOMNode().value.trim();
        if (!label)
            return false;

        var category = {
            title: label
        };

        flux.dispatch({
            type: Events.user.created_category,
            category: category
        });

        this.refs.label.getDOMNode().value = '';
        this.setState({
            showForm: false
        });
        return false;
    },

    render: function() {
        var items = this.state.categories
            .filter(function(cat) { return cat.id != NONE_CATEGORY_ID; })
            .map(function (cat) {
                return (
                    <CategoryListItem cat={cat} key={cat.id} />
                );
        });

        var maybeForm = this.state.showForm ? CreateForm(this._onSave, this._onShowForm)
                                            : <tr/>;

        return (
        <div>
            <div className="top-panel panel panel-default">
                <div className="panel-heading">
                    <h3 className="title panel-title">Categories</h3>
                </div>

                <div className="panel-body">
                    <a className="btn btn-primary text-uppercase pull-right" href="#" onClick={this._onShowForm}>
                        add a category<strong>+</strong>
                    </a>
                </div>

                <table className="table table-striped table-hover table-bordered">
                    <thead>
                        <tr>
                            <th className="col-sm-10">CATEGORY NAME</th>
                            <th className="col-sm-2">ACTION</th>
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
});

