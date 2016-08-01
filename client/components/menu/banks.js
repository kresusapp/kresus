import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../store';

import { has } from '../../helpers';

let BankActiveItemComponent = props => (
    <div className="bank-details">
        <div className={ `icon icon-${props.access.uuid}` }></div>

        <div className="bank-name">
            <a href="#" onClick={ props.handleClick }>
                { props.access.name }
                <span className="caret"></span>
            </a>
        </div>
    </div>
);

let BankListItemComponent = connect(state => {
    return {};
}, dispatch => {
    return {
        handleClick: access => {
            actions.setCurrentAccessId(dispatch, access.id);
        }
    };
})(props => {
    let maybeActive = props.active ? 'active' : '';
    return (
        <li className={ maybeActive }>
            <span>
                <a href="#" onClick={ () => props.handleClick(props.access) }>
                    { props.access.name }
                </a>
            </span>
        </li>
    );
});

// State: [{name: bankName, id: bankId}]
class BankListComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showDropdown: false
        };
        this.toggleDropdown = this.toggleDropdown.bind(this);
    }

    toggleDropdown(e) {
        this.setState({ showDropdown: !this.state.showDropdown });
        e.preventDefault();
    }

    render() {
        let active = this.props.accesses.filter(access =>
            this.props.active === access.id
        ).map(access =>
            <BankActiveItemComponent
              key={ access.id }
              access={ access }
              handleClick={ this.toggleDropdown }
            />
        );

        let banks = this.props.accesses.map(access => {
            let isActive = this.props.active === access.id;
            return (
                <BankListItemComponent
                  key={ access.id }
                  access={ access }
                  active={ isActive }
                />
            );
        });

        let menu = this.state.showDropdown ? '' : 'dropdown-menu';
        let dropdown = this.state.showDropdown ? 'dropup' : 'dropdown';

        return (
            <div className={ `banks sidebar-list ${dropdown}` }>
                { active }
                <ul className={ menu }>{ banks }</ul>
            </div>
        );
    }
}

const Export = connect(state => {
    return {
        accesses: get.accesses(state),
        active: get.currentAccessId(state)
    };
}, () => {
    // No actions.
    return {};
})(BankListComponent);

export default Export;
