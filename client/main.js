import React from 'react';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';

// Global variables
import { actions, get, init, rx } from './store';
import { translate as $t } from './helpers';

// Components
import CategoryList from './components/categories';
import Charts from './components/charts';
import OperationList from './components/operations';
import Budget from './components/budget';
import DuplicatesList from './components/duplicates';
import Settings from './components/settings';

import About from './components/menu/about';
import BankList from './components/menu/banks';
import LocaleSelector from './components/menu/locale-selector';

import WeboobInstallReadme from './components/init/weboob-readme';
import AccountWizard from './components/init/account-wizard';
import Loading from './components/ui/loading';

const IS_SMALL_SCREEN = 768;

// Now this really begins.
class BaseApp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showing: 'reports'
        };

        this.menu = null;
        this.handleMenuToggle = this.handleMenuToggle.bind(this);
    }

    show(name) {
        return () => {
            this.props.resetSearch();
            this.setState({ showing: name });
        };
    }

    handleOpenFAQ() {
        window.open('https://kresus.org/faq.html');
    }

    handleMenuToggle() {
        this.menu.classList.toggle('menu-hidden');
    }

    render() {
        if (!this.props.isWeboobInstalled) {
            return <WeboobInstallReadme />;
        }

        if (this.props.processingReason) {
            return <Loading message={ this.props.processingReason } />;
        }

        if (!this.props.hasAccess) {
            return <AccountWizard />;
        }

        let mainComponent;
        let showing = this.state.showing;
        switch (showing) {
            case 'reports':
                mainComponent = <OperationList />;
                break;
            case 'budget':
                mainComponent = <Budget mainApp={ this } />;
                break;
            case 'charts':
                mainComponent = <Charts />;
                break;
            case 'categories':
                mainComponent = <CategoryList />;
                break;
            case 'similarities':
                mainComponent = <DuplicatesList />;
                break;
            case 'settings':
                mainComponent = <Settings />;
                break;
            default:
                alert(`unknown component to render: ${showing}!`);
                break;
        }

        let isActive = which => {
            return showing === which ? 'active' : '';
        };

        let menuClass = '';
        let handleContentClick = null;
        if (window.innerWidth < IS_SMALL_SCREEN) {
            menuClass = 'menu-hidden';
            handleContentClick = () => {
                this.menu.classList.add('menu-hidden');
            };
        }

        let menuElementCb = element => {
            this.menu = element;
        };

        return (
            <div>
                <header>
                    <button
                      className="menu-toggle"
                      onClick={ this.handleMenuToggle }>
                        <span className="fa fa-navicon" />
                    </button>

                    <h1>
                        <a href="#">
                            { $t('client.KRESUS') }
                        </a>
                    </h1>

                    <LocaleSelector />
                </header>

                <main>
                    <nav
                      ref={ menuElementCb }
                      className={ menuClass }>
                        <div className="banks-accounts-list">
                            <BankList />
                        </div>

                        <div className="sidebar-section-list">
                            <ul>
                                <li
                                  className={ isActive('reports') }
                                  onClick={ this.show('reports') }>
                                    <i className="fa fa-briefcase" />
                                    { $t('client.menu.reports') }
                                </li>
                                <li
                                  className={ isActive('budget') }
                                  onClick={ this.show('budget') }>
                                    <i className="fa fa-heartbeat" />
                                    { $t('client.menu.budget') }
                                </li>
                                <li
                                  className={ isActive('charts') }
                                  onClick={ this.show('charts') }>
                                    <i className="fa fa-line-chart" />
                                    { $t('client.menu.charts') }
                                </li>
                                <li
                                  className={ isActive('similarities') }
                                  onClick={ this.show('similarities') }>
                                    <i className="fa fa-clone" />
                                    { $t('client.menu.similarities') }
                                </li>
                                <li
                                  className={ isActive('categories') }
                                  onClick={ this.show('categories') }>
                                    <i className="fa fa-list-ul" />
                                    { $t('client.menu.categories') }
                                </li>
                                <li
                                  className={ isActive('settings') }
                                  onClick={ this.show('settings') }>
                                    <i className="fa fa-cogs" />
                                    { $t('client.menu.settings') }
                                </li>
                                <li
                                  onClick={ this.handleOpenFAQ }>
                                    <i className="fa fa-question" />
                                    { $t('client.menu.support') }
                                </li>
                            </ul>
                        </div>

                        <div className="sidebar-about">
                            <About />
                        </div>
                    </nav>

                    <div
                      id="content"
                      onClick={ handleContentClick }>
                        { mainComponent }
                    </div>
                </main>
            </div>
        );
    }
}

BaseApp.propTypes = {
    // True if weboob 1.1 (at least) is installed.
    isWeboobInstalled: React.PropTypes.bool.isRequired,

    // True if the user has at least one bank access.
    hasAccess: React.PropTypes.bool.isRequired,

    // Reset all the search fields to no search.
    resetSearch: React.PropTypes.func.isRequired,

    // Null if there's no background processing, or a string explaining why there is otherwise.
    processingReason: React.PropTypes.string
};

let Kresus = connect(state => {
    return {
        isWeboobInstalled: get.isWeboobInstalled(state),
        hasAccess: get.currentAccessId(state) !== null,
        processingReason: get.backgroundProcessingReason(state),
        // Force re-rendering when the locale changes.
        locale: get.setting(state, 'locale')
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
    </Provider>, document.querySelector('#app'));
}).catch(err => {
    alert(`Error when starting the app:\n${err}`);
});
