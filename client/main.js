// Components
import T from './components/Translated';
import AccountListComponent from './components/AccountList';
import BankListComponent from './components/BankList';
import CategoryComponent from './components/CategoryList';
import ChartComponent from './components/Charts';
import OperationListComponent from './components/OperationList';
import SimilarityComponent from './components/Similarity';
import SettingsComponent from './components/Settings';
import LoadScreenComponent from './components/LoadScreen';
import MainAccountWizard from './components/MainAccountWizard';

import React from 'react';

// Global variables
import {store, State} from './store';

// Now this really begins.
class Kresus extends React.Component {

    constructor() {
        super();
        this.state = {
            showing: 'reports'
        }
    }

    componentDidMount() {
        // Fake mutations to re-trigger rendering
        store.on(State.weboob, () => this.setState({ showing: this.state.showing }));
        store.on(State.banks, () => this.setState({ showing: this.state.showing }));
    }

    show(name) {
        return () => this.setState({ showing: name });
    }

    render() {

        if (!store.isWeboobInstalled()) {
            setTimeout(() => {
                // Force reloading after 2 minutes
                window.location = '';
            }, 1000 * 60 * 2);
            return <LoadScreenComponent />
        }

        if (store.getCurrentBank() === null) {
            return <MainAccountWizard />;
        }

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
        <div>
            <div className="row navbar navbar-inverse visible-xs">
                <button className="navbar-toggle" data-toggle="offcanvas" data-target=".sidebar">
                    <span className="glyphicon glyphicon-menu-hamburger"></span>
                </button>
                <a className="navbar-brand" href="#"><T k='KRESUS'>KRESUS</T></a>
            </div>

            <div className="row">
                <div className="sidebar offcanvas-xs col-sm-2 col-xs-10">
                    <div className="logo sidebar-light">
                        <i className="fa fa-money"> </i>
                        <a href="#"><T k='KRESUS'>KRESUS</T></a>
                    </div>
                    
                    <BankListComponent />
                    <AccountListComponent />

                    <div className="sidebar-section-list">
                        <ul>
                            <li className={IsActive('reports')} onClick={this.show('reports')}>
                                <i className="fa fa-briefcase"> </i>
                                <T k='menu.reports'>Reports</T>
                            </li>
                            <li className={IsActive('charts')} onClick={this.show('charts')}>
                                <i className="fa fa-line-chart"> </i>
                                <T k='menu.charts'>Graphics</T>
                            </li>
                            <li className={IsActive('similarities')} onClick={this.show('similarities')}>
                                <i className="fa fa-clone"> </i>
                                <T k='menu.similarities'>Duplicates</T>
                            </li>
                            <li className={IsActive('categories')} onClick={this.show('categories')}>
                                <i className="fa fa-list-ul"> </i>
                                <T k='menu.categories'>Categories</T>
                            </li>
                            <li className={IsActive('settings')} onClick={this.show('settings')}>
                                <i className="fa fa-cogs"> </i>
                                <T k='menu.settings'>Settings</T>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="col-sm-2"></div>

                <div className="main-block col-xs-12 col-sm-10">
                    <div className="main-container">
                        {mainComponent}
                    </div>
                </div>
            </div>
        </div>
        );
    }
};

store.setupKresus(function() {
    React.render(<Kresus />, document.querySelector('#main'));
});
