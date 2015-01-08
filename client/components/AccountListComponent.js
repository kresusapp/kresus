/** @jsx React.DOM */

// Constants
var Events = require('../Events');
var debug = require('../Helpers').debug;

// Global variables
var store = require('../store');
var flux = require('../flux/dispatcher');

// Props: account: Account
var AccountListItem = React.createClass({

    _onClick: function() {
        debug('click on a particular account');
        flux.dispatch({
            type: Events.user.selected_account,
            account: this.props.account
        });
    },

    render: function() {
        return (
            <li className="active">
                <span>
                    <a href="#" onClick={this._onClick}>{this.props.account.title}</a>
                </span>
            </li>
        );
    }
});

// State: accounts: [Account]
var AccountListComponent = module.exports = React.createClass({

    getInitialState: function() {
        return {
            accounts: []
        };
    },

    _listener: function() {
        this.setState({
            accounts: store.accounts
        });
    },

    componentDidMount: function() {
        store.on(Events.server.loaded_accounts, this._listener);
    },

    componentWillUnmount: function() {
        store.removeListener(Events.server.loaded_accounts, this._listener);
    },

    render: function() {
        var accounts = this.state.accounts.map(function (a) {
            return (
                <AccountListItem key={a.id} account={a} />
            );
        });

        return (
            <div className="thr_div">
                <ul className="top"><span className="topic">Accounts</span>
                    {accounts}
                </ul>
            </div>
        );
    }
});

