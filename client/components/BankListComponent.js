/** @jsx React.DOM */

// Constants
var Events = require('../Events');

// Global variables
var bankListStore = require('../stores/bankListStore');
var flux = require('../flux/dispatcher');

// Props: bank: Bank
var BankListItemComponent = React.createClass({

    _onClick: function() {
        flux.dispatch({
            type: Events.BANK_CHANGED,
            bank: this.props.bank
        });
    },

    render: function() {
        return (
            <li><a onClick={this._onClick}>{this.props.bank.name}</a></li>
        );
    }
});

// State: [bank]
var BankListComponent = module.exports = React.createClass({

    _bankListListener: function() {
        this.setState({
            banks: bankListStore.list
        });
    },

    getInitialState: function() {
        return {
            banks: []
        }
    },

    componentDidMount: function() {
        bankListStore.on(Events.BANK_LIST_CHANGED, this._bankListListener);
    },

    componentWillUnmount: function() {
        bankListStore.removeListener(Events.BANK_LIST_CHANGED, this._bankListListener);
    },

    render: function() {
        //var setCurrentBank = this.props.setCurrentBank;
        var banks = this.state.banks.map(function (b) {
            return (
                <BankListItemComponent key={b.id} bank={b} />
            )
        });

        return (
            <div>
                Banks
                <ul className='row'>
                    {banks}
                </ul>
                <hr/>
            </div>
        );
    }
});
