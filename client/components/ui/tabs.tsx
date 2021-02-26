import React, { useCallback } from 'react';
import { Route, Switch, Redirect, NavLink, useLocation, useHistory } from 'react-router-dom';

export interface TabDescriptor {
    name: string;
    component: () => React.ReactNode;
}

const TabsContainer = (props: {
    // A map of tabs to display where the key is the tab identifier and the value
    // is the tab's name and component.
    tabs: Map<string, TabDescriptor>;

    // The default tab.
    defaultTab: string;

    // The selected tab.
    selectedTab?: string;
}) => {
    const location = useLocation();
    const history = useHistory();

    const onChange = useCallback(
        event => {
            const newPath = event.target.value;
            // Only modify current path if necessary
            if (location.pathname !== newPath) {
                history.push(newPath);
            }
        },
        [location, history]
    );

    const routes = [];
    const tabsLinks = [];
    const tabsOptions = [];
    for (const [path, tab] of props.tabs) {
        routes.push(
            <Route key={path} path={path}>
                {tab.component()}
            </Route>
        );

        tabsLinks.push(
            <li key={path}>
                <NavLink activeClassName="active" to={path}>
                    {tab.name}
                </NavLink>
            </li>
        );

        tabsOptions.push(
            <option key={path} value={path}>
                {tab.name}
            </option>
        );
    }

    return (
        <>
            <div className="tabs-container-selector">
                <ul>{tabsLinks}</ul>
                <select
                    className="form-element-block"
                    value={props.selectedTab}
                    onChange={onChange}>
                    {tabsOptions}
                </select>
            </div>
            <div className="tab-content">
                <Switch>
                    {routes}
                    <Redirect to={props.defaultTab} push={false} />
                </Switch>
            </div>
        </>
    );
};

TabsContainer.displayName = 'TabsContainer';

export default TabsContainer;
