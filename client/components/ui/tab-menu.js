import React from 'react';
import { NavLink, matchPath } from 'react-router-dom';

class TabMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.defaultValue
        };
        this.handleSelectorChange = this.handleSelectorChange.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleChange(value) {
        this.setState({ value }, () => this.props.onChange(value));
    }

    handleResize() {
        let value = '';
        let location = window.location.pathname;
        for (let [route] of this.props.tabs) {
            let match = matchPath(route, location);
            if (match !== null && match.url && match.url.length) {
                value = route;
                break;
            }
        }
        this.setState({ value });
    }

    handleSelectorChange(event) {
        this.handleChange(event.target.value);
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
              value={ this.state.value }
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

    defaultValue: (props, propName, componentName) => {
        if (typeof props.defaultValue !== 'string' && props.tabs.has('defaultValue')) {
            return new Error(`Invalide prop 'defaultValue' of ${componentName} should be defined and be a key in props 'tabs'`);
        }
    },

    // The callback to call when a tab has been selected
    onChange: React.PropTypes.func.isRequired
};

export default TabMenu;
