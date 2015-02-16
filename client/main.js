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
var SettingsComponent = require('./components/SettingsComponent');

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
        store.loadCategories();
        store.once(Events.server.loaded_categories, store.loadAllBanks);
        store.once(Events.server.loaded_operations, this._adjustSidebarHeight);
        this._adjustSidebarHeight();
    },

    _adjustSidebarHeight: function() {
        // What an horrible hack.  So this triggers rendering two times, just
        // to make sure the sidebar on the left has the right size as the
        // entire app.  Bleh.  Don't judge me.
        $('#sidebar').height(0)
                     .height($('html').height());
    },

    _show: function(name) {
        return function() {
            this.setState({ showing: name }, this._adjustSidebarHeight);
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
                mainComponent = <SettingsComponent/>
                break;
            default:
                alert('unknown component to render: '  + showing + '!');
                break;
        }

        function IsActive(which) {
            return showing === which ? 'active' : '';
        }

        return (
        <div className="row">
            <div id="sidebar" className="sidebar hidden-xs col-sm-3">
                <div className="logo sidebar-light">
                    <a href="#">KRESUS</a>
                </div>

                <div className="sidebar-section-list">
                    <ul>
                        <li className={IsActive('reports')} onClick={this._show('reports')}>
                            <span className="sidebar-section-reports"> </span>Report
                        </li>
                        <li className={IsActive('charts')} onClick={this._show('charts')}>
                            <span className="sidebar-section-charts"> </span>Charts
                        </li>
                        <li className={IsActive('categories')} onClick={this._show('categories')}>
                            <span className="sidebar-section-categories"> </span>Categories
                        </li>
                        <li className={IsActive('similarities')} onClick={this._show('similarities')}>
                            <span className="sidebar-section-similarities"> </span>Similarities
                        </li>
                        <li className={IsActive('settings')} onClick={this._show('settings')}>
                            <span className="sidebar-section-settings"> </span>Settings
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="sidebar-bank-header">Banks</h3>
                </div>

                <BankListComponent />
                <AccountListComponent />
            </div>

            <div className="main-block col-xs-12 col-sm-9">
                <div className="main-container">

                    {mainComponent}

                </div>
            </div>
        </div>
        );
    }
});

React.renderComponent(<Kresus />, document.querySelector('#main'));
