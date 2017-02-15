import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, NavLink, Switch } from 'react-router-dom';
import { connect, Provider } from 'react-redux';

// Global variables
import { get, init, rx } from './store';
import { translate as $t } from './helpers';

// Components
import BankList from './components/menu/banks';
import CategoryList from './components/categories';
import Charts from './components/charts';
import OperationList from './components/operations';
import Budget from './components/budget';
import DuplicatesList from './components/duplicates';
import Settings from './components/settings';
import AccountWizard from './components/init/account-wizard';
import WeboobInstallReadme from './components/init/weboob-readme';
import Loading from './components/ui/loading';
import About from './components/menu/about';

// Now this really begins.
class BaseApp extends React.Component {

    componentDidMount() {
        // Block any scrolling from happening outside of the menu when the menu
        // is open
        $('#kresus-menu').on('show.bs.offcanvas', () => {
            $(document.body).css('overflow', 'hidden')
            .on('touchmove.bs', event => {
                if (!$(event.target).closest('.offcanvas')) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            });
        }).on('hidden.bs.offcanvas', () => {
            $(document.body).css('overflow', 'auto').off('touchmove.bs');
        });
    }

    componentWillUnmount() {
        $('#kresus-menu').off('show.bs.offcanvas, hidden.bs.offcanvas');
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

        return (
            <div>
                <div className="row navbar main-navbar visible-xs">
                    <button
                      className="navbar-toggle"
                      data-toggle="offcanvas"
                      data-disablescrolling="false"
                      data-target=".sidebar">
                        <span className="fa fa-navicon" />
                    </button>
                    <a
                      href="#"
                      className="navbar-brand">
                        { $t('client.KRESUS') }
                    </a>
                </div>

                <div className="row">
                    <div
                      id="kresus-menu"
                      className="sidebar offcanvas-xs col-sm-3 col-xs-10">
                        <div className="logo sidebar-light">
                            <a
                              href="#"
                              className="app-title">
                                { $t('client.KRESUS') }
                            </a>
                        </div>

                        <div className="banks-accounts-list">
                            <BankList />
                        </div>

                        <div className="sidebar-section-list">
                            <ul>
                                <li>
                                    <NavLink
                                      to='/reports'
                                      activeClassName={ 'active' }>
                                        <i className="fa fa-briefcase" />
                                        { $t('client.menu.reports') }
                                    </NavLink>
                                </li>
                                <li >
                                    <NavLink
                                      to='/budget'
                                      activeClassName={ 'active' }>
                                        <i className="fa fa-heartbeat" />
                                        { $t('client.menu.budget') }
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                      to='/charts'
                                      activeClassName={ 'active' }>
                                        <i className="fa fa-line-chart" />
                                        { $t('client.menu.charts') }
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                      to='/duplicates'
                                      activeClassName={ 'active' }>
                                        <i className="fa fa-clone" />
                                        { $t('client.menu.similarities') }
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                      to='/categories'
                                      activeClassName={ 'active' }>
                                        <i className="fa fa-list-ul" />
                                        { $t('client.menu.categories') }
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                      to='/settings'
                                      activeClassName={ 'active' }>
                                        <i className="fa fa-cogs" />
                                        { $t('client.menu.settings') }
                                    </NavLink>
                                </li>
                                <li>
                                    <a href="https://kresus.org/faq.html">
                                        <i className="fa fa-question" />
                                        { $t('client.menu.support') }
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div className="sidebar-about">
                            <About />
                        </div>
                    </div>

                    <div className="col-sm-3" />

                    <div className="main-block col-xs-12 col-sm-9">
                        <div className="main-container">
                            <Switch>
                                <Route
                                  path='/'
                                  component={ OperationList }
                                  exact={ true }
                                />
                                <Route
                                  path='/reports'
                                  component={ OperationList }
                                />
                                <Route
                                  path='/budget'
                                  component={ Budget }
                                />
                                <Route
                                  path='/charts'
                                  component={ Charts }
                                />
                                <Route
                                  path='/categories'
                                  component={ CategoryList }
                                />
                                <Route
                                  path='/duplicates'
                                  component={ DuplicatesList }
                                />
                                <Route
                                  path='/settings'
                                  component={ Settings }
                                />
                            </Switch>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

BaseApp.propTypes = {
    // True if weboob 1.1 (at least) is installed.
    isWeboobInstalled: React.PropTypes.bool.isRequired,

    // True if the user has at least one bank access.
    hasAccess: React.PropTypes.bool.isRequired,

    // Null if there's no background processing, or a string explaining why there is otherwise.
    processingReason: React.PropTypes.string
};

let Kresus = connect(state => {
    return {
        isWeboobInstalled: get.isWeboobInstalled(state),
        hasAccess: get.currentAccessId(state) !== null,
        processingReason: get.backgroundProcessingReason(state)
    };
})(BaseApp);

init().then(initialState => {
    ReactDOM.render(
        <Provider store={ rx }>
            <HashRouter>
                <Kresus />
            </HashRouter>
        </Provider>
    , document.querySelector('#main'));
}).catch(err => {
    alert(`Error when starting the app:\n${err}`);
});
