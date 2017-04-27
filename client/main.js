import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, Link, Redirect } from 'react-router-dom';
import { connect, Provider } from 'react-redux';

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

import Menu from './components/menu';

import WeboobInstallReadme from './components/init/weboob-readme';
import AccountWizard from './components/init/account-wizard';
import Loading from './components/ui/loading';

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
        let { currentAccountId, initialAccountId, location, currentAccount } = this.props;
        if (this.props.processingReason) {
            return <Loading message={ this.props.processingReason } />;
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

            if (typeof currentAccountId !== 'undefined' && currentAccount === null) {
                return (
                    <Redirect
                      to={ location.pathname.replace(currentAccountId, initialAccountId) }
                      push={ false }
                    />
                );
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
                        <Link
                          to="/"
                          className="navbar-brand">
                            { $t('client.KRESUS') }
                        </Link>
                    </div>

                    <div className="row">
                        <Route
                          path='/:section/:subsection?/:currentAccountId'
                          component={ Menu }
                        />
                        <div className="col-sm-3" />

                        <div className="main-block col-xs-12 col-sm-9 col-sm-offset-3">
                            <div className="main-container">
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
                                      path='/settings/:settingPanel?/:currentAccountId'
                                      component={ Settings }
                                    />
                                    <Redirect
                                      to={ `/reports/${initialAccountId}` }
                                      push={ false }
                                    />
                                </Switch>
                            </div>
                        </div>
                    </div>
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
    isWeboobInstalled: React.PropTypes.bool.isRequired,

    // True if the user has at least one bank access.
    hasAccess: React.PropTypes.bool.isRequired,

    // Null if there's no background processing, or a string explaining why there is otherwise.
    processingReason: React.PropTypes.string
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
        currentAccount: get.accountById(state, currentAccountId)
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
                      path='/'
                      component={ Kresus }
                    />
                </Switch>
            </Provider>
        </BrowserRouter>
    , document.querySelector('#main'));
}).catch(err => {
    debug(err);
    alert(`Error when starting the app:\n${err}\nCheck the console.`);
});
