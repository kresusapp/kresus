import React from 'react';
import { NavLink } from 'react-router-dom';

class TabMenu extends React.Component {
    constructor(props) {
        super(props);

        this.handleSelectorChange = this.handleSelectorChange.bind(this);
    }

    handleSelectorChange(event) {
        let newPath = event.target.value;
        // Only modify current path if necessary
        if (this.props.location.pathname !== newPath) {
            this.props.push(newPath);
        }
    }

    render() {
        let tabsItems = [];
        let tabsOptions = [];

        for (let [key, name] of this.props.tabs) {
            tabsItems.push(
                <li
                  role="presentation"
                  key={ key }>
                    <NavLink
                      activeClassName={ 'active' }
                      to={ key }>
                        { name }
                    </NavLink>
                </li>
            );

            tabsOptions.push(
                <option
                  key={ key }
                  value={ key }>
                    { name }
                </option>
            );
        }

        return (<div>
            <ul className="nav nav-pills hidden-xs">
                { tabsItems }
            </ul>

            <select
              className="form-control visible-xs-block"
              value={ this.props.selected }
              onChange={ this.handleSelectorChange }>
                { tabsOptions }
            </select>
        </div>);
    }
}

TabMenu.propTypes = {
    // A map of tabs to display where the key is the tab identifier and the value
    // is the tab's name
    tabs: React.PropTypes.object.isRequired,

    selected: (props, propName, componentName) => {
        if (typeof props.selected !== 'string' && !props.tabs.has(props.selected)) {
            return new Error(`Invalide prop 'selected' of ${componentName} should be defined and be a key in props 'tabs'`);
        }
    },

    // Function to add an entry to the history.
    push: React.PropTypes.func.isRequired,

    // Object containg the current location in the app.
    location: React.PropTypes.object.isRequired
};

export default TabMenu;
