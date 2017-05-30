import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, Link, Redirect } from 'react-router-dom';
import { connect, Provider } from 'react-redux';
import PropTypes from 'prop-types';

// Global variables
import { get, init, rx } from './store';
import { translate as $t, debug } from './helpers';

// Components
import CategoryList from './components/categories';
import Charts from './components/charts';
import OperationList from './components/operations';
import Budget from './components/budget';
import DuplicatesList from './components/duplicates';
import Settings from './components/settings';
import LocaleSelector from './components/menu/locale-selector';

import Menu from './components/menu';

import WeboobInstallReadme from './components/init/weboob-readme';
import AccountWizard from './components/init/account-wizard';
import Loading from './components/ui/loading';

const IS_SMALL_SCREEN = 768;

// Now this really begins.
class BaseApp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isMenuHidden: window.innerWidth < IS_SMALL_SCREEN
        };
        this.menu = null;
        this.handleMenuToggle = this.handleMenuToggle.bind(this);
    }

    handleMenuToggle() {
        this.setState({ isMenuHidden: !this.state.isMenuHidden });
    }

    render() {
        let { currentAccountId, initialAccountId, location, maybeCurrentAccount } = this.props;

        let handleContentClick = null;
        if (window.innerWidth < IS_SMALL_SCREEN) {
            handleContentClick = () => {
                this.setState({ isMenuHidden: true });
            };
        }

        const menu = props => (
            <Menu
              { ...props }
              isHidden={ this.state.isMenuHidden }
            />
        );

        if (this.props.processingReason) {
            return <Loading message={ $t(this.props.processingReason) } />;
        }

        const initializeKresus = props => {
            if (!this.props.hasAccess) {
                return <AccountWizard { ...props } />;
            }
            return <Redirect to='/' />;
        };

        const noBackend = () => {
            if (!this.props.isWeboobInstalled) {
                return <WeboobInstallReadme />;
            }
            return <Redirect to='/' />;
        };

        const renderMain = () => {
            if (!this.props.isWeboobInstalled) {
                return (
                    <Redirect
                      to='/weboob-readme'
                      push={ false }
                    />
                );
            }
            if (!this.props.hasAccess) {
                return (
                    <Redirect
                      to='/initialize'
                      push={ false }
                    />
                );
            }

            // This is to handle the case where the accountId in the URL exists, but does not
            // match any account (for exemple the accountId was modified by the user).
            if (typeof currentAccountId !== 'undefined' && maybeCurrentAccount === null) {
                return (
                    <Redirect
                      to={ location.pathname.replace(currentAccountId, initialAccountId) }
                      push={ false }
                    />
                );
            }

            return (
                <div>
                    <header>
                        <button
                          className="menu-toggle"
                          onClick={ this.handleMenuToggle }>
                            <span className="fa fa-navicon" />
                        </button>

                        <h1>
                            <Link to="/">
                                { $t('client.KRESUS') }
                            </Link>
                        </h1>

                        <LocaleSelector />
                    </header>

                    <main>
                        <Route
                          path='/:section/:subsection?/:currentAccountId'
                          render={ menu }
                        />

                        <div
                          id="content"
                          onClick={ handleContentClick }>

                            <Switch>
                                <Route
                                  path={ '/reports/:currentAccountId' }
                                  component={ OperationList }
                                />
                                <Route
                                  path={ '/budget/:currentAccountId' }
                                  component={ Budget }
                                />
                                <Route
                                  path='/charts/:chartsPanel?/:currentAccountId'
                                  component={ Charts }
                                />
                                <Route
                                  path='/categories/:currentAccountId'
                                  component={ CategoryList }
                                />
                                <Route
                                  path='/duplicates/:currentAccountId'
                                  component={ DuplicatesList }
                                />
                                <Route
                                  path='/settings/:tab?/:currentAccountId'
                                  component={ Settings }
                                />
                                <Redirect
                                  to={ `/reports/${initialAccountId}` }
                                  push={ false }
                                />
                            </Switch>
                        </div>
                    </main>
                </div>
            );
        };

        return (
            <Switch>
                <Route
                  path='/weboob-readme'
                  render={ noBackend }
                />
                <Route
                  path='/initialize/:subsection?'
                  render={ initializeKresus }
                />
                <Route render={ renderMain } />
            </Switch>
        );
    }
}

BaseApp.propTypes = {
    // True if weboob 1.1 (at least) is installed.
    isWeboobInstalled: PropTypes.bool.isRequired,

    // True if the user has at least one bank access.
    hasAccess: PropTypes.bool.isRequired,

    // Null if there's no background processing, or a string explaining why there is otherwise.
    processingReason: PropTypes.string
};

let Kresus = connect((state, ownProps) => {
    let initialAccountId = get.initialAccountId(state);
    let currentAccountId;
    if (ownProps.match) {
        currentAccountId = ownProps.match.params.currentAccountId;
    }
    return {
        isWeboobInstalled: get.isWeboobInstalled(state),
        hasAccess: get.accessByAccountId(state, initialAccountId) !== null,
        processingReason: get.backgroundProcessingReason(state),
        // Force re-rendering when the locale changes.
        locale: get.setting(state, 'locale'),
        initialAccountId,
        currentAccountId,
        maybeCurrentAccount: get.accountById(state, currentAccountId)
    };
})(BaseApp);

init().then(initialState => {

    Object.assign(rx.getState(), initialState);

    ReactDOM.render(
        <BrowserRouter basename='/#'>
            <Provider store={ rx }>
                <Switch>
                    <Route
                      path='/:section/:subsection?/:currentAccountId'
                      exact={ true }
                      component={ Kresus }
                    />
                    <Route
                      path='/*'
                      component={ Kresus }
                    />
                </Switch>
            </Provider>
        </BrowserRouter>
    , document.querySelector('#app'));
}).catch(err => {
    debug(err);
    alert(`Error when starting the app:\n${err}\nCheck the console.`);
});
