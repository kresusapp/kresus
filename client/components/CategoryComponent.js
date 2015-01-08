/** @jsx React.DOM */

// Constants
var Events = require('../Events');
var debug = require('../Helpers').debug;

// Global variables
var store = require('../store');
var flux = require('../flux/dispatcher');

function NYI(event) {
    alert('not yet implemented!');
    event.preventDefault();
}

function CreateForm(onSave, onCancel, previousValue) {

    function onKeyUp(e) {
        if (e.keyCode == 13) {
            return onSave(e);
        }
        return true;
    }

    return (<ul className="table-row clearfix">
                <li className="input-text">
                    <input type="text" className="form-control" placeholder='Label'
                      defaultValue={previousValue || ''} onKeyUp={onKeyUp}
                      ref="label" />
                </li>
                <li className="input-text">
                    (NYI)
                </li>
                <li>
                    <a href="#" className="save" onClick={onSave}>save</a>
                    <a href="#" className="cancel" onClick={onCancel}>cancel</a>
                </li>
            </ul>);
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

    // TODO
    _onDelete: NYI,

    render: function() {

        if (this.state.editMode)
            return CreateForm(this._onSaveEdit, this._onCancelEdit, this.props.cat.title);

        return (
            <ul className="table-row clearfix" key={this.props.cat.id}>
                <li>{this.props.cat.title}</li>
                <li>(NYI)</li>
                <li>
                    <a href="#" onClick={this._onShowEdit} className="edit">edit</a>
                    <a href="#" onClick={this._onDelete} className="cancel">delete</a>
                </li>
            </ul>
        );
    }
});

module.exports = React.createClass({

    _listener: function() {
        this.setState({
            categories: store.categories
        });
    },

    getInitialState: function() {
        return {
            showForm: false,
            categories: []
        }
    },

    componentDidMount: function() {
        store.subscribeMaybeGet(Events.server.loaded_categories, this._listener);
    },

    componentWillUnmount: function() {
        store.removeListener(Events.server.loaded_categories, this._listener);
    },

    _onShowForm: function(e) {
        e.preventDefault();
        this.setState({
            showForm: !this.state.showForm
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
        var items = this.state.categories.map(function (cat) {
            return (
                <CategoryListItem cat={cat} key={cat.id} />
            );
        });

        var maybeForm = this.state.showForm ? CreateForm(this._onSave, this._onShowForm)
                                            : '';

        return (
            <div className="category-block">
                <div className="clearfix title text-uppercase">
                    <span>Add a category</span>
                    <div className="add-new pull-right">
                        <a className="text-uppercase" href="#" onClick={this._onShowForm}>add new <strong>+</strong></a>
                    </div>
                </div>
                <div className="category">
                    <div className="category-top clearfix">
                        <div className="search pull-right clearfix">
                            <span className="pull-left">search</span><input type="text" className="form-control pull-right" placeholder="" />
                        </div>
                    </div>

                    <div className="category-table">
                        <ul className="table-header clearfix">
                            <li>CATEGORY NAME <a className="pull-right" href="#"><span>&#9652;</span></a></li>
                            <li>SUPERCATEGORY <a className="pull-right" href="#"><span>&#9652;</span></a></li>
                            <li>ACTION<a className="pull-right up-n-down" href="#"><span>&#9652;</span><span>&#9662;</span></a></li>
                        </ul>
                        {maybeForm}
                        {items}
                    </div>
                </div>
            </div>
        );
    }
});

