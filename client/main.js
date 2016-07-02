import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

// Global variables
import { store, rx, State } from './store';
import { translate as $t } from './helpers';

// Components
import AccountList from './components/menu/accounts';
import BankList from './components/menu/banks';
import CategoryList from './components/categories';
import Charts from './components/charts';
import OperationList from './components/operations';
import DuplicatesList from './components/duplicates';
import Settings from './components/settings';
import AccountWizard from './components/init/account-wizard';
import WeboobInstallReadme from './components/init/weboob-readme';

// Now this really begins.
class Kresus extends React.Component {

    constructor() {
        super();
        this.state = {
            showing: 'reports'
        };
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
            return <WeboobInstallReadme />;
        }

        if (store.getCurrentAccess() === null) {
            return <AccountWizard />;
        }

        let mainComponent;
        let showing = this.state.showing;
        switch (showing) {
            case 'reports':
                mainComponent = <OperationList/>;
                break;
            case 'charts':
                mainComponent = <Charts/>;
                break;
            case 'categories':
                mainComponent = <CategoryList/>;
                break;
            case 'similarities':
                mainComponent = <DuplicatesList/>;
                break;
            case 'settings':
                mainComponent = <Settings/>;
                break;
            default:
                alert(`unknown component to render: ${showing}!`);
                break;
        }

        let isActive = which => showing === which ? 'active' : '';

        return (
            <div>
                <div className="row navbar main-navbar visible-xs">
                    <button
                      className="navbar-toggle"
                      data-toggle="offcanvas"
                      data-target=".sidebar">
                        <span className="fa fa-navicon"></span>
                    </button>
                    <a className="navbar-brand" href="#">{ $t('client.KRESUS') }</a>
                </div>

                <div className="row">
                    <div className="sidebar offcanvas-xs col-sm-3 col-xs-10">
                        <div className="logo sidebar-light">
                            <a href="#" className="app-title">{ $t('client.KRESUS') }</a>
                        </div>

                        <div className="banks-accounts-list">
                            <BankList />
                            <AccountList />
                        </div>

                        <div className="sidebar-section-list">
                            <ul>
                                <li
                                  className={ isActive('reports') }
                                  onClick={ this.show('reports') }>
                                    <i className="fa fa-briefcase"> </i>
                                    { $t('client.menu.reports') }
                                </li>
                                <li
                                  className={ isActive('charts') }
                                  onClick={ this.show('charts') }>
                                    <i className="fa fa-line-chart"> </i>
                                    { $t('client.menu.charts') }
                                </li>
                                <li
                                  className={ isActive('similarities') }
                                  onClick={ this.show('similarities') }>
                                    <i className="fa fa-clone"> </i>
                                    { $t('client.menu.similarities') }
                                </li>
                                <li
                                  className={ isActive('categories') }
                                  onClick={ this.show('categories') }>
                                    <i className="fa fa-list-ul"> </i>
                                    { $t('client.menu.categories') }
                                </li>
                                <li
                                  className={ isActive('settings') }
                                  onClick={ this.show('settings') }>
                                    <i className="fa fa-cogs"> </i>
                                    { $t('client.menu.settings') }
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-sm-3"></div>

                    <div className="main-block col-xs-12 col-sm-9">
                        <div className="main-container">
                            { mainComponent }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

store.setupKresus(() => {
    ReactDOM.render(<Provider store={ rx }>
        <Kresus />
    </Provider>, document.querySelector('#main'));
});
