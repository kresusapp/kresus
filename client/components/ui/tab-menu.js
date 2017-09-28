import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

const TabMenu = props => {
    let tabsItems = [];
    let tabsOptions = [];

    const handleSelectorChange = event => {
        let newPath = event.target.value;
        // Only modify current path if necessary
        if (props.location.pathname !== newPath) {
            props.history.push(newPath);
        }
    };

    for (let [key, name] of props.tabs) {
        tabsItems.push(
            <li role="presentation" key={key}>
                <NavLink activeClassName="active" to={key}>
                    {name}
                </NavLink>
            </li>
        );

        tabsOptions.push(
            <option key={key} value={key}>
                {name}
            </option>
        );
    }

    return (
        <div>
            <ul className="nav nav-pills hidden-xs">{tabsItems}</ul>

            <select
                className="form-control visible-xs-block"
                value={props.selected}
                onChange={handleSelectorChange}
            >
                {tabsOptions}
            </select>
        </div>
    );
};

TabMenu.propTypes = {
    // A map of tabs to display where the key is the tab identifier and the value
    // is the tab's name
    tabs: PropTypes.object.isRequired,

    selected: (props, propName, componentName) => {
        if (typeof props.selected !== 'string' && !props.tabs.has(props.selected)) {
            return new Error(
                `Invalid prop 'selected' of ${componentName} should be defined and be a key in 'tabs' prop`
            );
        }
    },

    // The history object, providing access to the history API.
    // Automatically added by the Route component.
    history: PropTypes.object.isRequired,

    // Object containg the current location in the app.
    location: PropTypes.object.isRequired
};

export default TabMenu;
