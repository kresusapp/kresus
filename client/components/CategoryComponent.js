/** @jsx React.DOM */

// Constants
var Events = require('../Events');
var debug = require('../Helpers').debug;

// Global variables
var store = require('../store');
var flux = require('../flux/dispatcher');

var CategoryList = React.createClass({

    _listener: function() {
        this.setState({
            categories: store.categories
        });
    },

    getInitialState: function() {
        return {
            categories: []
        }
    },

    componentDidMount: function() {
        store.subscribeMaybeGet(Events.CATEGORIES_LOADED, this._listener);
    },

    componentWillUnmount: function() {
        store.removeListener(Events.CATEGORIES_LOADED, this._listener);
    },

    render: function() {
        var items = this.state.categories.map(function (cat) {
            return (
                <li key={cat.id}>{cat.title}</li>
            );
        });
        return (
            <ul>{items}</ul>
        );
    }
});

var CategoryForm = React.createClass({

    onSubmit: function(e) {
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
        return false;
    },

    render: function() {
        return (
            <form onSubmit={this.onSubmit}>
                <div className='row'>
                    <div className='small-10 columns'>
                        <input type='text' placeholder='Label of new category' ref='label' />
                    </div>
                    <div className='small-2 columns'>
                        <input type='submit' className='button postfix' value='Submit' />
                    </div>
                </div>
            </form>
        )
    }
});

module.exports = React.createClass({

    render: function() {
        return (
            <div>
                <h1>Categories</h1>
                <CategoryList />
                <h3>Add a category</h3>
                <CategoryForm />
            </div>
        );
    }
});
