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

    getInitialState: function() {
        return {
            showing: 'reports'
        }
    },

    componentDidMount: function() {
        // Let's go.
        store.getCategories();
        store.once(Events.CATEGORIES_LOADED, function() {
            store.getAllBanks();
        });
    },

    _show: function(name) {
        return function() {
            this.setState({ showing: name });
        }.bind(this);
    },

    render: function() {

        var mainComponent;
        var showing = this.state.showing;
        switch(showing) {
            case "reports":
                mainComponent = <OperationListComponent/>
                break;
            case "charts":
                mainComponent = <ChartComponent/>
                break;
            case "categories":
                mainComponent = <CategoryComponent/>
                break;
            case "similarities":
                mainComponent = <SimilarityComponent/>
                break;
            case "settings":
                // TODO
                alert('NYI, showing operations list instead');
                showing = 'reports';
                mainComponent = <OperationListComponent/>
                break;
            default:
                alert('unknown component to render: '  + showing + '!');
                break;
        }

        function IsActive(which) {
            return showing === which ? 'active' : '';
        }

        return (
        <div>
            <div className="side-bar pull-left">
                <div className="logo sidebar_light">
                    <a href="#">KRESUS</a>
                </div>

                <div className="fir_div">
                    <ul className="bor_li">
                        <li className={IsActive('reports')} onClick={this._show('reports')}>
                            <span className="rep li_st"> </span>Report
                        </li>
                        <li className={IsActive('charts')} onClick={this._show('charts')}>
                            <span className="chr li_st"> </span>Charts
                        </li>
                        <li className={IsActive('categories')} onClick={this._show('categories')}>
                            <span className="cat li_st"> </span>Categories
                        </li>
                        <li className={IsActive('similarities')} onClick={this._show('similarities')}>
                            <span className="sim li_st"> </span>Similarities
                        </li>
                    </ul>
                </div>

                <div className="bank_div">
                    <ul className="bor_li_bnk">
                        <li ><span className="bank sec_st"> </span>Banks</li>
                    </ul>
                </div>

                <BankListComponent />
                <AccountListComponent />
            </div>

            <div className="main-block pull-right">
                <div className="main-container">

                    {mainComponent}

                </div>
            </div>
        </div>
        );
    }
});

React.renderComponent(<Kresus />, document.querySelector('#main'));
