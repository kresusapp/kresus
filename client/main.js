/** @jsx React.DOM */

// Helpers
var Events = require('./Events');

// Classes
var AccountListComponent = require('./components/AccountListComponent');
var BankListComponent = require('./components/BankListComponent');
var CategoryComponent = require('./components/CategoryComponent');
var ChartComponent = require('./components/ChartComponent');
var OperationListComponent = require('./components/OperationListComponent');
var SimilarityComponent = require('./components/SimilarityComponent');

// Global variables
var store = require('./store');

// Now this really begins.
var Kresus = React.createClass({

    componentDidMount: function() {
        // Let's go.
        store.getCategories();
        store.once(Events.CATEGORIES_LOADED, function() {
            store.getAllBanks();
        });
    },

    render: function() {
        return (
            <div className='row'>

            <div className='panel small-2 columns'>
                <BankListComponent />
                <AccountListComponent />
            </div>

            <div className="small-10 columns">
                <ul className="tabs" data-tab>
                    <li className="tab-title active"><a href="#panel-operations">Operations</a></li>
                    <li className="tab-title"><a href="#panel-charts">Charts</a></li>
                    <li className="tab-title"><a href="#panel-similarities">Similarities</a></li>
                    <li className="tab-title"><a href="#panel-categories">Categories</a></li>
                </ul>

                <div className="tabs-content">

                    <div className='content active' id='panel-operations'>
                        <OperationListComponent />
                    </div>

                    <div className='content' id='panel-similarities'>
                        <SimilarityComponent />
                    </div>

                    <div className='content' id='panel-charts'>
                        <ChartComponent />
                    </div>

                    <div className='content' id='panel-categories'>
                        <CategoryComponent />
                    </div>

                </div>
            </div>

            </div>
        );
    }
});

React.renderComponent(<Kresus />, document.querySelector('#main'));
