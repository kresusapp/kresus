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

var CategoryListItem = React.createClass({

    // TODO
    _onEdit: NYI,

    // TODO
    _onDelete: NYI,

    render: function() {
        return (
            <ul className="table-row clearfix" key={this.props.cat.id}>
                <li>{this.props.cat.title}</li>
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
        store.subscribeMaybeGet(Events.CATEGORIES_LOADED, this._listener);
    },

    componentWillUnmount: function() {
        store.removeListener(Events.CATEGORIES_LOADED, this._listener);
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
            type: Events.CATEGORY_CREATED,
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

        var maybeForm = this.state.showForm ?
            (<ul className="table-row clearfix">
                <li className="input-text">
                    <input type="text" className="form-control" placeholder="Label" ref="label" />
                </li>
                <li className="input-text">
                    NYI
                </li>
                <li>
                    <a href="#" className="save" onClick={this._onSave}>save</a>
                    <a href="#" className="cancel" onClick={this._onShowForm}>cancel</a>
                </li>
            </ul>)
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
                    <div className="category-table">
                        <ul className="table-header clearfix">
                            <li>CATEGORY NAME </li>
                        </ul>
                        {maybeForm}
                        {items}
                    </div>
                </div>
            </div>
        );
    }
});

