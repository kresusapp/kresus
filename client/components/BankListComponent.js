/** @jsx React.DOM */

// Constants
var Events = require('../Events');
var debug = require('../Helpers').debug;

// Global variables
var store = require('../store');
var flux = require('../flux/dispatcher');

// Props: bank: Bank
var BankListItemComponent = React.createClass({

    _onClick: function() {
        flux.dispatch({
            type: Events.user.selected_bank,
            bankId: this.props.bank.id
        });
    },

    // TODO make a real "active" state
    render: function() {
        return (
            <li className="active"><span><a href="#" onClick={this._onClick}>{this.props.bank.name}</a></span></li>
        );
    }
});

// State: [{name: bankName, id: bankId}]
var BankListComponent = module.exports = React.createClass({

    _bankListListener: function() {
        this.setState({
            banks: store.getBanks()
        });
    },

    getInitialState: function() {
        return {
            banks: []
        }
    },

    componentDidMount: function() {
        store.on(Events.server.loaded_banks, this._bankListListener);
    },

    componentWillUnmount: function() {
        store.removeListener(Events.server.loaded_banks, this._bankListListener);
    },

    render: function() {
        var banks = this.state.banks.map(function (b) {
            return (
                <BankListItemComponent key={b.id} bank={b} />
            )
        });

        return (
            <div className="sidebar-list">
                <ul className="sidebar-sublist"><span className="topic">Banks</span>
                    {banks}
                </ul>
            </div>
        );
    }
});
