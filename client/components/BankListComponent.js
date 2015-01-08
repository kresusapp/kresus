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
        debug('click on a bank item');
        flux.dispatch({
            type: Events.SELECTED_BANK_CHANGED,
            bank: this.props.bank
        });
    },

    render: function() {
        return (
            <li className="active"><span><a href="#" onClick={this._onClick}>{this.props.bank.name}</a></span></li>
        );
    }
});

// State: [bank]
var BankListComponent = module.exports = React.createClass({

    _bankListListener: function() {
        this.setState({
            banks: store.banks
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
            <div className="sec_div">
                <ul className="top"><span className="topic">Banks</span>
                    {banks}
                </ul>
            </div>
        );
    }
});
