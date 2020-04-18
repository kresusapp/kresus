import React from 'react';
import { Route, Switch, Redirect, NavLink, useLocation, useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';

const TabsContainer = props => {
    let location = useLocation();
    let history = useHistory();
    function handleSelectorChange(event) {
        let newPath = event.target.value;
        // Only modify current path if necessary
        if (location.pathname !== newPath) {
            history.push(newPath);
        }
    }

    let routes = [];
    let tabsLinks = [];
    let tabsOptions = [];
    for (let [path, tab] of props.tabs) {
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
        <React.Fragment>
            <div className="tabs-container-selector">
                <ul>{tabsLinks}</ul>
                <select
                    className="form-element-block"
                    value={props.selectedTab}
                    onChange={handleSelectorChange}>
                    {tabsOptions}
                </select>
            </div>
            <div className="tab-content">
                <Switch>
                    {routes}
                    <Redirect to={props.defaultTab} push={false} />
                </Switch>
            </div>
        </React.Fragment>
    );
};

TabsContainer.propTypes = {
    // A map of tabs to display where the key is the tab identifier and the value
    // is the tab's name and component.
    tabs: PropTypes.instanceOf(Map).isRequired,

    // The default tab.
    defaultTab: PropTypes.string.isRequired,

    // The selected tab.
    selectedTab: (props, propName, componentName) => {
        if (
            typeof props.selectedTab !== 'undefined' &&
            typeof props.selectedTab !== 'string' &&
            !props.tabs.has(props.selectedTab)
        ) {
            return new Error(
                `Invalid prop 'selectedTab' of ${componentName} should be a key in 'tabs' prop if defined`
            );
        }
    }
};

export default TabsContainer;
