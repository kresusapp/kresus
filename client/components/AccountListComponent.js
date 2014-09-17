/** @jsx React.DOM */

// Constants
var Events = require('../Events');
var debug = require('../Helpers').debug;

// Global variables
var bankStore = require('../stores/bankStore');
var flux = require('../flux/dispatcher');

// Props: account: Account
var AccountListItem = React.createClass({

    _onClick: function() {
        debug('click on a particular account');
        flux.dispatch({
            type: Events.SELECTED_ACCOUNT_CHANGED,
            account: this.props.account
        });
    },

    render: function() {
        return (
            <li>
                <a onClick={this._onClick}>{this.props.account.title}</a>
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
            accounts: bankStore.accounts
        });
    },

    componentDidMount: function() {
        bankStore.on(Events.ACCOUNTS_LOADED, this._listener);
    },

    componentWillUnmount: function() {
        bankStore.removeListener(Events.ACCOUNTS_LOADED, this._listener);
    },

    render: function() {
        var accounts = this.props.accounts.map(function (a) {
            return (
                <AccountListItem key={a.id} account={a} />
            );
        });

        return (
            <div>
                Accounts
                <ul className='row'>
                    {accounts}
                </ul>
            </div>
        );
    }
});

