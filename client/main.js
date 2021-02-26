import React, { useContext, useMemo, useCallback, useEffect, Suspense } from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter,
    Route,
    Switch,
    Link,
    Redirect,
    useRouteMatch,
    useParams,
} from 'react-router-dom';
import { connect, Provider, useDispatch } from 'react-redux';
import throttle from 'lodash.throttle';
import { ToastContainer } from 'react-toastify';

// Global variables
import { get, init, reduxStore, actions } from './store';
import { translate as $t, debug, computeIsSmallScreen, useKresusState } from './helpers';
import URL from './urls';
import { FORCE_DEMO_MODE, URL_PREFIX } from '../shared/instance';

// Components
import About from './components/about';
import Reports from './components/reports';
import Budget from './components/budget';
import DuplicatesList from './components/duplicates';
import Settings from './components/settings';
import Accesses from './components/accesses';
import Categories from './components/categories';
import Transactions from './components/transactions';

import Onboarding from './components/onboarding';

import Dashboard from './components/dashboard';
import Menu from './components/menu';
import DropdownMenu from './components/menu/dropdown';

import DemoButton from './components/header/demo-button';

import DisplayIf from './components/ui/display-if';
import ErrorReporter from './components/ui/error-reporter';
import Overlay, { LoadingMessage } from './components/overlay';
import { DriverAccount } from './components/drivers/account';
import { getDriver, ViewContext, DriverType, NoDriver } from './components/drivers';

import 'normalize.css/normalize.css';
import 'font-awesome/css/font-awesome.css';
import 'react-toastify/dist/ReactToastify.min.css';
import './css/base.css';

const RESIZE_THROTTLING = 100;

// Lazy-loaded components
const ChartsComp = React.lazy(() => import('./components/charts'));

const Charts = props => {
    return (
        <Suspense fallback={<LoadingMessage message={$t('client.spinner.loading')} />}>
            <ChartsComp {...props} />
        </Suspense>
    );
};

const SectionTitle = () => {
    let titleKey = URL.sections.title(useParams());
    if (titleKey === null) {
        return null;
    }
    let title = $t(`client.menu.${titleKey}`);
    return <span className="section-title">&nbsp;/&nbsp;{title}</span>;
};

const RedirectIfUnknownAccount = props => {
    let view = useContext(ViewContext);
    let initialAccountId = useKresusState(state => get.initialAccountId(state));
    if (view.driver === NoDriver) {
        return <Redirect to={URL.reports.url(new DriverAccount(initialAccountId))} push={false} />;
    }
    return props.children;
};

const RedirectIfNotAccount = props => {
    let view = useContext(ViewContext);
    if (view.driver.type !== DriverType.Account) {
        return <Redirect to={URL.reports.url(view.driver)} push={false} />;
    }
    return props.children;
};

const View = () => {
    let params = useParams();

    const currentDriver = useMemo(() => {
        return getDriver(params.driver, params.value);
    }, [params.driver, params.value]);

    const banks = useKresusState(state => state.banks);

    const currentView = useMemo(() => {
        return currentDriver.getView(banks);
    }, [currentDriver, banks]);

    return (
        <ViewContext.Provider value={currentView}>
            <Switch>
                <Route path={URL.reports.pattern}>
                    <RedirectIfUnknownAccount>
                        <Reports />
                    </RedirectIfUnknownAccount>
                </Route>
                <Route path={URL.budgets.pattern}>
                    <RedirectIfUnknownAccount>
                        <Budget />
                    </RedirectIfUnknownAccount>
                </Route>
                <Route path={URL.charts.pattern}>
                    <RedirectIfUnknownAccount>
                        <Charts />
                    </RedirectIfUnknownAccount>
                </Route>
                <Route path={URL.duplicates.pattern}>
                    <RedirectIfNotAccount>
                        <DuplicatesList />
                    </RedirectIfNotAccount>
                </Route>
                <Route path={URL.transactions.pattern}>
                    <Transactions />
                </Route>
            </Switch>
        </ViewContext.Provider>
    );
};

const Kresus = () => {
    // Retrieve the URL prefix and remove a potential trailing '/'.
    let urlPrefix = useKresusState(state => {
        return get.instanceProperty(state, URL_PREFIX).replace(/\/$/g, '');
    });
    let initialAccountId = useKresusState(state => get.initialAccountId(state));
    let forcedDemoMode = useKresusState(state => get.boolInstanceProperty(state, FORCE_DEMO_MODE));
    let isSmallScreen = useKresusState(state => get.isSmallScreen(state));

    let dispatch = useDispatch();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    let handleWindowResize = useCallback(
        throttle(event => {
            let newIsSmallScreen = computeIsSmallScreen(event.target.innerWidth);
            if (newIsSmallScreen !== isSmallScreen) {
                actions.setIsSmallScreen(dispatch, newIsSmallScreen);
            }
        }, RESIZE_THROTTLING),
        [dispatch, isSmallScreen]
    );

    let handleToggleMenu = useCallback(() => {
        actions.toggleMenu(dispatch);
    }, [dispatch]);

    let hideMenu = useCallback(() => {
        actions.toggleMenu(dispatch, true);
    }, [dispatch]);

    let handleContentClick = isSmallScreen ? hideMenu : null;

    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);

        // Preload the components
        /* eslint-disable-next-line no-unused-expressions*/
        import('./components/charts');

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    });

    return (
        <ErrorReporter>
            <BrowserRouter basename={`${urlPrefix}/#`}>
                <Switch>
                    <Route path={[URL.weboobReadme.pattern, URL.onboarding.pattern]}>
                        <DisplayOrRedirectToInitialScreen>
                            <Onboarding />
                        </DisplayOrRedirectToInitialScreen>
                    </Route>
                    <Route path="/" exact={false}>
                        <DisplayOrRedirectToInitialScreen>
                            <header>
                                <button className="menu-toggle" onClick={handleToggleMenu}>
                                    <span className="fa fa-navicon" />
                                </button>
                                <h1>
                                    <Link to={URL.dashboard.url()}>{$t('client.KRESUS')}</Link>
                                </h1>
                                <Route path={URL.sections.pattern}>
                                    <SectionTitle />
                                </Route>

                                <DisplayIf condition={forcedDemoMode}>
                                    <p className="disable-demo-mode">{$t('client.demo.forced')}</p>
                                </DisplayIf>
                                <DisplayIf condition={!forcedDemoMode}>
                                    <DemoButton />
                                </DisplayIf>

                                <DropdownMenu />
                            </header>

                            <main>
                                <Route path={URL.sections.genericPattern}>
                                    <Menu />
                                </Route>
                                <div id="content-container">
                                    <div className="content" onClick={handleContentClick}>
                                        <Switch>
                                            <Route path={URL.view.pattern}>
                                                <View />
                                            </Route>
                                            <Route path={URL.settings.pattern}>
                                                <Settings />
                                            </Route>
                                            <Route path={URL.categories.pattern}>
                                                <Categories />
                                            </Route>
                                            <Route path={URL.about.pattern}>
                                                <About />
                                            </Route>
                                            <Route path={URL.accesses.pattern}>
                                                <Accesses />
                                            </Route>
                                            <Route path={URL.dashboard.pattern}>
                                                <Dashboard />
                                            </Route>
                                            <Redirect
                                                to={URL.reports.url(
                                                    new DriverAccount(initialAccountId)
                                                )}
                                                push={false}
                                            />
                                        </Switch>
                                    </div>
                                </div>
                            </main>
                        </DisplayOrRedirectToInitialScreen>
                    </Route>
                    <Redirect from="" to="/" push={false} />
                </Switch>

                <ToastContainer />
                <Overlay />
            </BrowserRouter>
        </ErrorReporter>
    );
};

const DisplayOrRedirectToInitialScreen = connect(state => {
    return {
        hasAccess: get.accessIds(state).length > 0,
        isWeboobInstalled: get.isWeboobInstalled(state),
    };
})(props => {
    let displayWeboobReadme = useRouteMatch({ path: URL.weboobReadme.pattern });
    let displayOnboarding = useRouteMatch({ path: URL.onboarding.pattern });

    if (!props.isWeboobInstalled) {
        if (!displayWeboobReadme) {
            return <Redirect to={URL.weboobReadme.url()} push={false} />;
        }
    } else if (!props.hasAccess) {
        if (!displayOnboarding) {
            return <Redirect to={URL.onboarding.url()} push={false} />;
        }
    } else if (displayWeboobReadme || displayOnboarding) {
        return <Redirect to="/" push={false} />;
    }

    return props.children;
});

export default async function runKresus() {
    try {
        let initialState = await init();

        // Define the redux store initial content.
        Object.assign(reduxStore.getState(), initialState);

        const appElement = document.getElementById('app');

        // Remove the loading class on the app element.
        appElement.classList.remove('before-load');

        ReactDOM.render(
            // Pass the Redux store as context to the rest of the app.
            <Provider store={reduxStore}>
                <Kresus />
            </Provider>,
            appElement
        );
    } catch (err) {
        let errMessage = '';
        if (err) {
            debug(err);
            errMessage = `\n${err.shortMessage || JSON.stringify(err)}`;
        }
        window.alert(`Error when starting the app:${errMessage}\nCheck the console.`);
    }
}
