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
        if (!this.props.isWeboobInstalled) {
            return <WeboobInstallReadme />;
        }

        if (this.props.processingReason) {
            return <Loading message={ this.props.processingReason } />;
        }

        if (!this.props.hasAccess) {
            return <AccountWizard />;
        }

        const rootRedirect = () => {
            let { initialAccountId } = this.props;
            return (
                <Redirect
                  to={ `/reports/${initialAccountId}` }
                  push={ false }
                />
            );
        };

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
                      path='/:section/:subsection?/:currentAccountId?'
                      component={ Menu }
                    />
                    <div className="col-sm-3" />

                    <div className="main-block col-xs-12 col-sm-9">
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
                                  path='/charts/:chartsPanel/:currentAccountId'
                                  component={ Charts }
                                  exact={ true }
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
                                  path='/settings/:settingPanel?/:currentAccountId?'
                                  component={ Settings }
                                />
                                <Route
                                  render={ rootRedirect }
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
    // TODO : Initial AccountId
    let initialAccountId = get.currentAccountId(state);

    return {
        isWeboobInstalled: get.isWeboobInstalled(state),
        hasAccess: get.currentAccessId(state) !== null,
        processingReason: get.backgroundProcessingReason(state),
        // Force re-rendering when the locale changes.
        locale: get.setting(state, 'locale'),
        initialAccountId
    };
})(BaseApp);

init().then(initialState => {

    Object.assign(rx.getState(), initialState);

    ReactDOM.render(
        <Provider store={ rx }>
            <BrowserRouter basename='/#'>
                <Route component={ Kresus } />
            </BrowserRouter>
        </Provider>
    , document.querySelector('#main'));
}).catch(err => {
    debug(err);
    alert(`Error when starting the app:\n${err}\nCheck the console.`);
});
