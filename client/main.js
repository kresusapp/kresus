import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, Link, Redirect } from 'react-router-dom';
import { connect, Provider } from 'react-redux';
import PropTypes from 'prop-types';
import throttle from 'lodash.throttle';

// Global variables
import { get, init, rx, actions } from './store';
import { translate as $t, debug, computeIsSmallScreen } from './helpers';

// Lazy loader
import LazyLoader from './components/lazyLoader';

// Components
import About from './components/about';
import CategoryList from './components/categories';
import loadCharts from 'bundle-loader?lazy!./components/charts';
import OperationList from './components/operations';
import Budget from './components/budget';
import DuplicatesList from './components/duplicates';
import Settings from './components/settings';
import LocaleSelector from './components/menu/locale-selector';

import Menu from './components/menu';

import AccountWizard from './components/init/account-wizard';
import Loading from './components/ui/loading';
import ThemeLoaderTag from './components/ui/theme-link';

// The list of the available sections.
const sections = ['about', 'budget', 'categories', 'charts', 'duplicates', 'reports', 'settings'];

const RESIZE_THROTTLING = 100;

// Lazy-loaded components
const Charts = props => (
    <LazyLoader load={loadCharts}>
        {ChartsComp => {
            // Note: We have to put the loading element here and not in the
            // LazyLoader component to ensure we are not flickering the
            // loading screen on subsequent load of the component.
            return ChartsComp ? (
                <ChartsComp {...props} />
            ) : (
                <Loading message={$t('client.spinner.loading')} />
            );
        }}
    </LazyLoader>
);

// Now this really begins.
class BaseApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isMenuHidden: this.props.isSmallScreen
        };
    }

    handleMenuToggle = () => {
        this.setState({ isMenuHidden: !this.state.isMenuHidden });
    };

    handleWindowResize = throttle(event => {
        let isSmallScreen = computeIsSmallScreen(event.target.innerWidth);
        if (isSmallScreen !== this.props.isSmallScreen) {
            this.props.handleResize(isSmallScreen);
        }
    }, RESIZE_THROTTLING);

    componentDidMount() {
        window.addEventListener('resize', this.handleWindowResize);

        // Preload the components
        loadCharts(() => {
            // Do nothing, just preload
        });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize);
    }

    makeMenu = props => <Menu {...props} isHidden={this.state.isMenuHidden} />;

    makeWeboobOrRedirect = () => {
        if (!this.props.isWeboobInstalled) {
            return <AccountWizard />;
        }
        return <Redirect to="/" />;
    };

    initializeKresus = props => {
        if (!this.props.isWeboobInstalled) {
            return <Redirect to="/weboob-readme" push={false} />;
        }
        if (!this.props.hasAccess) {
            return <AccountWizard {...props} />;
        }
        return <Redirect to="/" />;
    };

    makeSectionTitle = props => {
        // The routing component expects a '/#' basename and is not able to deal with kresus'
        // url prefix. It will further redirect to '/#' but params.section will not match
        // the default section (report) on the first render. This check avoids a warning
        // error in the client logs".
        return props.match && sections.includes(props.match.params.section) ? (
            <span className="section-title">
                &nbsp;/&nbsp;
                {$t(`client.menu.${props.match.params.section}`)}
            </span>
        ) : null;
    };

    renderMain = () => {
        if (!this.props.isWeboobInstalled) {
            return <Redirect to="/weboob-readme" push={false} />;
        }
        if (!this.props.hasAccess) {
            return <Redirect to="/initialize" push={false} />;
        }

        let handleContentClick = this.props.isSmallScreen ? this.hideMenu : null;

        let { currentAccountId, initialAccountId, location, maybeCurrentAccount } = this.props;

        // This is to handle the case where the accountId in the URL exists, but does not
        // match any account (for exemple the accountId was modified by the user).
        if (typeof currentAccountId !== 'undefined' && maybeCurrentAccount === null) {
            return (
                <Redirect
                    to={location.pathname.replace(currentAccountId, initialAccountId)}
                    push={false}
                />
            );
        }

        return (
            <div>
                <header>
                    <button className="menu-toggle" onClick={this.handleMenuToggle}>
                        <span className="fa fa-navicon" />
                    </button>

                    <h1>
                        <Link to="/">{$t('client.KRESUS')}</Link>
                    </h1>

                    <Route path="/:section" render={this.makeSectionTitle} />

                    <LocaleSelector />
                </header>

                <main>
                    <Route path="/:section/:subsection?/:currentAccountId" render={this.makeMenu} />

                    <div id="content" onClick={handleContentClick}>
                        <Switch>
                            <Route path={'/reports/:currentAccountId'} component={OperationList} />
                            <Route path={'/budget/:currentAccountId'} component={Budget} />
                            <Route
                                path="/charts/:chartsPanel?/:currentAccountId"
                                component={Charts}
                            />
                            <Route path="/categories/:currentAccountId" component={CategoryList} />
                            <Route
                                path="/duplicates/:currentAccountId"
                                component={DuplicatesList}
                            />
                            <Route path="/settings/:tab?/:currentAccountId" component={Settings} />
                            <Route path="/about/:currentAccountId" component={About} />
                            <Redirect to={`/reports/${initialAccountId}`} push={false} />
                        </Switch>
                    </div>
                </main>
            </div>
        );
    };

    hideMenu = () => {
        this.setState({ isMenuHidden: true });
    };

    render() {
        if (this.props.processingReason) {
            return <Loading message={$t(this.props.processingReason)} />;
        }

        return (
            <Switch>
                <Route path="/weboob-readme" render={this.makeWeboobOrRedirect} />
                <Route path="/initialize/:subsection?" render={this.initializeKresus} />
                <Route render={this.renderMain} />
            </Switch>
        );
    }
}

BaseApp.propTypes = {
    // True if an adequate version of weboob is installed.
    isWeboobInstalled: PropTypes.bool.isRequired,

    // True if the user has at least one bank access.
    hasAccess: PropTypes.bool.isRequired,

    // Null if there's no background processing, or a string explaining why there is otherwise.
    processingReason: PropTypes.string
};

let Kresus = connect(
    (state, ownProps) => {
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
            maybeCurrentAccount: get.accountById(state, currentAccountId),
            isSmallScreen: get.isSmallScreen(state)
        };
    },
    dispatch => {
        return {
            handleResize(isSmallScreen) {
                actions.resize(dispatch, isSmallScreen);
            }
        };
    }
)(BaseApp);

function makeKresus(props) {
    return <Kresus {...props} />;
}

const makeOnLoadHandler = (initialState, resolve, reject) => loaded => {
    if (loaded) {
        resolve(initialState);
    } else if (get.setting(initialState, 'theme') === 'default') {
        reject();
    }
};

export default function runKresus() {
    init()
        .then(initialState => {
            Object.assign(rx.getState(), initialState);
            return new Promise((resolve, reject) => {
                ReactDOM.render(
                    <Provider store={rx}>
                        <ThemeLoaderTag onLoad={makeOnLoadHandler(initialState, resolve, reject)} />
                    </Provider>,
                    document.querySelector('#postload')
                );
            });
        })
        .then(initialState => {
            let urlPrefix = get.setting(initialState, 'url-prefix');

            // Remove trailing '/'
            urlPrefix = urlPrefix.replace(/\/$/g, '');

            ReactDOM.render(
                <BrowserRouter basename={`${urlPrefix}/#`}>
                    <Provider store={rx}>
                        <Switch>
                            <Route
                                path="/:section/:subsection?/:currentAccountId"
                                render={makeKresus}
                            />
                            <Route component={Kresus} />
                        </Switch>
                    </Provider>
                </BrowserRouter>,
                document.querySelector('#app')
            );
        })
        .catch(err => {
            debug(err);
            alert(`Error when starting the app:\n${err}\nCheck the console.`);
        });
}
