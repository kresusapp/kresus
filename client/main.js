import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, Link, Redirect } from 'react-router-dom';
import { connect, Provider } from 'react-redux';
import PropTypes from 'prop-types';
import throttle from 'lodash.throttle';
import { ToastContainer } from 'react-toastify';

// Global variables
import { get, init, rx, actions } from './store';
import { translate as $t, debug, computeIsSmallScreen } from './helpers';
import URL from './urls';

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

import AccountWizard from './components/init/account-wizard';

import Menu from './components/menu';
import ParamMenu from './components/menu/params';

import Loading from './components/ui/loading';
import ThemeLoaderTag from './components/ui/theme-link';
import ErrorReporter from './components/ui/error-reporter';
import Modal from './components/ui/modal';

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

class BaseApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isMenuHidden: this.props.isSmallScreen,
            isSettingsMenuShown: false
        };
    }

    handleMenuToggle = () => {
        this.setState({ isMenuHidden: !this.state.isMenuHidden });
    };

    handleSettingsMenuToggle = () => {
        this.setState({ isSettingsMenuShown: !this.state.isSettingsMenuShown });
    };

    handleWindowResize = throttle(event => {
        let isSmallScreen = computeIsSmallScreen(event.target.innerWidth);
        if (isSmallScreen !== this.props.isSmallScreen) {
            this.props.setIsSmallScreen(isSmallScreen);
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
            return <Redirect to={URL.weboobReadme.url()} push={false} />;
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
        let titleKey = URL.sections.title(props.match);
        if (titleKey === null) {
            return null;
        }
        let title = $t(`client.menu.${titleKey}`);
        return <span className="section-title">&nbsp;/&nbsp;{title}</span>;
    };

    renderMain = () => {
        if (!this.props.isWeboobInstalled) {
            return <Redirect to={URL.weboobReadme.url()} push={false} />;
        }
        if (!this.props.hasAccess) {
            return <Redirect to={URL.initialize.url()} push={false} />;
        }

        let handleContentClick = this.props.isSmallScreen ? this.hideMenu : null;

        let { currentAccountId, initialAccountId, location, currentAccountExists } = this.props;

        // This is to handle the case where the accountId in the URL exists, but does not
        // match any account (for example the accountId was modified by the user).
        if (typeof currentAccountId !== 'undefined' && !currentAccountExists) {
            return (
                <Redirect
                    to={location.pathname.replace(currentAccountId, initialAccountId)}
                    push={false}
                />
            );
        }

        let maybeSettingsMenu = null;
        if (this.state.isSettingsMenuShown) {
            maybeSettingsMenu = (
                <ParamMenu
                    currentAccountId={currentAccountId}
                    onClick={this.handleSettingsMenuToggle}
                />
            );
        }

        return (
            <ErrorReporter>
                <Modal />
                <header>
                    <button className="menu-toggle" onClick={this.handleMenuToggle}>
                        <span className="fa fa-navicon" />
                    </button>
                    <h1>
                        <Link to="/">{$t('client.KRESUS')}</Link>
                    </h1>
                    <Route path={URL.sections.pattern} render={this.makeSectionTitle} />
                    <div className="settings-dropdown">
                        <span
                            className="fa fa-cogs clickable"
                            onClick={this.handleSettingsMenuToggle}
                        />
                        {maybeSettingsMenu}
                    </div>
                </header>

                <main>
                    <Route path={URL.sections.genericPattern} render={this.makeMenu} />
                    <div id="content" onClick={handleContentClick}>
                        <Switch>
                            <Route path={URL.reports.pattern} component={OperationList} />
                            <Route path={URL.budgets.pattern} component={Budget} />
                            <Route path={URL.charts.pattern} component={Charts} />
                            <Route path={URL.categories.pattern} component={CategoryList} />
                            <Route path={URL.duplicates.pattern} component={DuplicatesList} />
                            <Route path={URL.settings.pattern} component={Settings} />
                            <Route path={URL.about.pattern} component={About} />
                            <Redirect to={URL.reports.url(initialAccountId)} push={false} />
                        </Switch>
                    </div>
                </main>

                <ToastContainer />
            </ErrorReporter>
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
                <Route path={URL.weboobReadme.pattern} render={this.makeWeboobOrRedirect} />
                <Route path={URL.initialize.pattern} render={this.initializeKresus} />
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
            currentAccountExists: get.accountById(state, currentAccountId) !== null,
            isSmallScreen: get.isSmallScreen(state)
        };
    },
    dispatch => {
        return {
            setIsSmallScreen(isSmallScreen) {
                actions.setIsSmallScreen(dispatch, isSmallScreen);
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
                            <Route path={URL.sections.genericPattern} render={makeKresus} />
                            <Route component={Kresus} />
                        </Switch>
                    </Provider>
                </BrowserRouter>,
                document.querySelector('#app')
            );
        })
        .catch(err => {
            let errMessage = '';
            if (err) {
                debug(err);
                errMessage = `\n${err.shortMessage || JSON.stringify(err)}`;
            }
            window.alert(`Error when starting the app:${errMessage}\nCheck the console.`);
        });
}
