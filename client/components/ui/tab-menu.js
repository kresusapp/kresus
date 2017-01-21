import React from 'react';

import { assert } from '../../helpers';

class TabMenu extends React.Component {
    constructor(props) {
        assert(props.tabs.has(props.defaultValue), 'The default tab must be in the tabs map');
        super(props);

        this.state = {
            showing: props.defaultValue
        };

        this.handleSelectorChange = this.handleSelectorChange.bind(this);
        this.handleTabClick = this.handleTabClick.bind(this);
    }

    handleChange(value) {
        if (value !== this.state.showing) {
            this.setState({
                showing: value
            });

            this.props.onChange(value);
        }
    }

    handleTabClick(event) {
        this.handleChange(event.target.dataset.value);
    }

    handleSelectorChange(event) {
        this.handleChange(event.target.value);
    }

    render() {
        let tabsItems = [];
        let tabsOptions = [];

        for (let [key, name] of this.props.tabs) {
            let liClass = this.state.showing === key ? 'active' : '';
            tabsItems.push(<li
              role="presentation"
              key={ key }
              className={ liClass }>
                <a
                  href="#"
                  data-value={ key }
                  onClick={ this.handleTabClick }>
                    { name }
                </a>
            </li>);

            tabsOptions.push(<option
              key={ key }
              value={ key }>
                { name }
            </option>);
        }

        return (<div>
            <ul className="nav nav-pills hidden-xs">
                { tabsItems }
            </ul>

            <select
              className="tab-menu-selector form-control visible-xs-block"
              defaultValue={ this.state.showing }
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

    // The menu default value
    defaultValue: React.PropTypes.string.isRequired,

    // The callback to call when a tab has been selected
    onChange: React.PropTypes.func.isRequired
};

export default TabMenu;
