import React from 'react';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';

// Global variables
import { actions, get, init, rx } from './store';
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
import Loading from './components/ui/loading';

// Now this really begins.
class BaseApp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showing: 'reports'
        };
    }

    show(name) {
        return () => {
            this.props.resetSearch();
            this.setState({ showing: name });
        };
    }

    render() {
        if (!this.props.isWeboobInstalled) {
            return <WeboobInstallReadme />;
        }

        if (this.props.backgroundProcessing) {
            return <Loading />;
        }

        if (!this.props.hasAccess) {
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

        let isActive = which => {
            return showing === which ? 'active' : '';
        };

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

let Kresus = connect(state => {
    return {
        isWeboobInstalled: get.isWeboobInstalled(state),
        hasAccess: get.currentAccessId(state) !== null,
        backgroundProcessing: get.backgroundProcessing(state)
    };
}, dispatch => {
    return {
        resetSearch: () => actions.resetSearch(dispatch)
    };
})(BaseApp);

init().then(initialState => {

    Object.assign(rx.getState(), initialState);

    ReactDOM.render(<Provider store={ rx }>
        <Kresus />
    </Provider>, document.querySelector('#main'));
}).catch(err => {
    alert(`Error when starting the app:\n${err}`);
});
