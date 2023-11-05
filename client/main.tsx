import React, { useContext, useMemo, useCallback, useEffect, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import {
    BrowserRouter,
    Route,
    Switch,
    Link,
    Redirect,
    useRouteMatch,
    useParams,
} from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import throttle from 'lodash.throttle';
import { ToastContainer } from 'react-toastify';

// Moment.js locales (must be imported from this file to avoid being run in
// nodejs context).
import 'moment/dist/locale/fr';
import 'moment/dist/locale/es';
import 'moment/dist/locale/tr';

// Global variables
import { get, init, reduxStore, actions } from './store';
import {
    translate as $t,
    debug,
    computeIsSmallScreen,
    useKresusState,
    assert,
    areWeFunYet,
} from './helpers';
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
import RecurringTransactionsList from './components/recurring-transactions/account-recurring-transactions-list';
import NewRecurringTransaction from './components/recurring-transactions/new-recurring-transaction';
import Onboarding from './components/onboarding';
import Dashboard from './components/dashboard';
import TransactionRules from './components/rules';
import Menu from './components/menu';
import DropdownMenu from './components/menu/dropdown';

import DemoButton from './components/header/demo-button';

import Form from './components/ui/form';
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

const Charts = () => {
    return (
        <Suspense fallback={<LoadingMessage message={$t('client.spinner.loading')} />}>
            <ChartsComp />
        </Suspense>
    );
};

const SectionTitle = () => {
    const titleKey = URL.sections.title(useParams());
    if (titleKey === null) {
        return null;
    }
    const title = $t(`client.menu.${titleKey}`);
    return <span className="section-title">&nbsp;/&nbsp;{title}</span>;
};

const RedirectIfUnknownAccount = (props: { children: React.ReactNode | React.ReactNode[] }) => {
    const view = useContext(ViewContext);
    const initialAccountId = useKresusState(state => get.initialAccountId(state));
    if (view.driver === NoDriver) {
        return <Redirect to={URL.reports.url(new DriverAccount(initialAccountId))} push={false} />;
    }
    return <>{props.children}</>;
};

export const RedirectIfNotAccount = (props: { children: React.ReactNode | React.ReactNode[] }) => {
    const view = useContext(ViewContext);
    if (view.driver.type !== DriverType.Account) {
        return <Redirect to={URL.reports.url(view.driver)} push={false} />;
    }
    return <>{props.children}</>;
};

const View = () => {
    const params = useParams<{
        driver: string;
        value: string;
    }>();

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
                    <RedirectIfNotAccount>
                        <RedirectIfUnknownAccount>
                            <Budget />
                        </RedirectIfUnknownAccount>
                    </RedirectIfNotAccount>
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
                <Route path={URL.newRecurringTransaction.pattern}>
                    <RedirectIfNotAccount>
                        <NewRecurringTransaction />
                    </RedirectIfNotAccount>
                </Route>
                <Route path={URL.recurringTransactions.pattern}>
                    <RedirectIfNotAccount>
                        <RecurringTransactionsList />
                    </RedirectIfNotAccount>
                </Route>
            </Switch>
        </ViewContext.Provider>
    );
};

const Kresus = () => {
    // Retrieve the URL prefix and remove a potential trailing '/'.
    const urlPrefix = useKresusState(state => {
        const prefix = get.instanceProperty(state, URL_PREFIX);
        if (prefix === null) {
            return '';
        }
        return prefix.replace(/\/$/g, '');
    });
    const initialAccountId = useKresusState(state => get.initialAccountId(state));
    const forcedDemoMode = useKresusState(state =>
        get.boolInstanceProperty(state, FORCE_DEMO_MODE)
    );
    const isSmallScreen = useKresusState(state => get.isSmallScreen(state));

    const dispatch = useDispatch();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleWindowResize = useCallback(
        throttle(event => {
            const newIsSmallScreen = computeIsSmallScreen(event.target.innerWidth);
            if (newIsSmallScreen !== isSmallScreen) {
                actions.setIsSmallScreen(dispatch, newIsSmallScreen);
            }
        }, RESIZE_THROTTLING),
        [dispatch, isSmallScreen]
    );

    const handleToggleMenu = useCallback(() => {
        actions.toggleMenu(dispatch);
    }, [dispatch]);

    const hideMenu = useCallback(() => {
        actions.toggleMenu(dispatch, true);
    }, [dispatch]);

    const handleContentClick = isSmallScreen ? hideMenu : undefined;

    useEffect(() => {
        // Remove the loading class on the app element.
        const appElement = document.getElementById('app');
        if (appElement) {
            appElement.classList.remove('before-load');
        }

        window.addEventListener('resize', handleWindowResize);
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    });

    return (
        <ErrorReporter>
            <BrowserRouter basename={`${urlPrefix}/#`}>
                <Switch>
                    <Route path={[URL.woobReadme.pattern, URL.onboarding.pattern]}>
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
                                            <Route path={URL.rules.pattern}>
                                                <TransactionRules />
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

interface AreWeFunYetProps {
    yearKey: string;
}

const AreWeFunYet = (props: AreWeFunYetProps) => {
    const { yearKey: key } = props;
    const handleFunLinkClick = useCallback(() => {
        if (window.localStorage) {
            window.localStorage.setItem(key, 'true');
        }
    }, [key]);

    return (
        <Form className="content">
            <p>
                <a className="backlink" href="/#" onClick={handleFunLinkClick}>
                    <span className="fa fa-chevron-left" />
                    <span className="link">{$t('client.fun.back')}</span>
                </a>
            </p>

            <div>
                {$t('client.fun.message')
                    .split('\n')
                    .map((line, idx) => (
                        <p key={idx}>{line}</p>
                    ))}
            </div>

            <Form.Toolbar>
                <a
                    className="btn"
                    href="https://liberapay.com/Kresus"
                    target="_blank"
                    onClick={handleFunLinkClick}
                    rel="noopener noreferrer">
                    {$t('client.fun.cancel')}
                </a>

                <a
                    className="btn primary"
                    href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&pp=ygUIcmlja3JvbGw%3D"
                    target="_blank"
                    onClick={handleFunLinkClick}
                    rel="noopener noreferrer">
                    {$t('client.fun.confirm')}
                </a>
            </Form.Toolbar>
        </Form>
    );
};

const DisplayOrRedirectToInitialScreen = (props: {
    children: React.ReactNode | React.ReactNode[];
}) => {
    const hasAccess = useKresusState(state => get.accessIds(state).length > 0);
    const isWoobInstalled = useKresusState(state => get.isWoobInstalled(state));

    const displayWoobReadme = useRouteMatch({ path: URL.woobReadme.pattern });
    const displayOnboarding = useRouteMatch({ path: URL.onboarding.pattern });

    if (!isWoobInstalled) {
        if (!displayWoobReadme) {
            return <Redirect to={URL.woobReadme.url()} push={false} />;
        }
    } else if (!hasAccess) {
        if (!displayOnboarding) {
            return <Redirect to={URL.onboarding.url()} push={false} />;
        }
    } else if (displayWoobReadme || displayOnboarding) {
        return <Redirect to="/" push={false} />;
    }

    const areWeFunYetYearKey = `arewefunyet-${new Date().getFullYear()}`;
    if (areWeFunYet() && !window.localStorage.getItem(areWeFunYetYearKey)) {
        return <AreWeFunYet yearKey={areWeFunYetYearKey} />;
    }

    return <>{props.children}</>;
};

export default async function runKresus() {
    try {
        const initialState = await init();

        // Define the redux store initial content.
        Object.assign(reduxStore.getState(), initialState);

        const appElement = document.getElementById('app');
        assert(appElement !== null, 'well, good luck :-)');

        createRoot(appElement).render(
            // Pass the Redux store as context to the rest of the app.
            <Provider store={reduxStore}>
                <Kresus />
            </Provider>
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
