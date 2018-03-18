import React from 'react';
import { Route, Switch, Redirect, NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

class TabsContainer extends React.Component {
    handleSelectorChange = event => {
        let newPath = event.target.value;
        // Only modify current path if necessary
        if (this.props.location.pathname !== newPath) {
            this.props.history.push(newPath);
        }
    };

    render() {
        let routes = [];
        let tabsLinks = [];
        let tabsOptions = [];
        for (let [path, tab] of this.props.tabs) {
            routes.push(<Route key={path} path={path} component={tab.component} />);

            tabsLinks.push(
                <li role="presentation" key={path}>
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
                        className="form-control"
                        value={this.props.selected}
                        onChange={this.handleSelectorChange}>
                        {tabsOptions}
                    </select>
                </div>
                <div className="tab-content">
                    <Switch>
                        {routes}
                        <Redirect to={this.props.redirect} push={false} />
                    </Switch>
                </div>
            </React.Fragment>
        );
    }
}

TabsContainer.propTypes = {
    // A map of tabs to display where the key is the tab identifier and the value
    // is the tab's name
    tabs: PropTypes.object.isRequired,

    redirect: PropTypes.string.isRequired,

    selected: PropTypes.string,

    // The history object, providing access to the history API.
    history: PropTypes.object.isRequired,

    // Location object (contains the current path).
    location: PropTypes.object.isRequired
};

export default TabsContainer;
