import React from 'react';
import { connect } from 'react-redux';

import { get } from '../../store';
import BankListItemComponent from './bank';

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

        return (
            <div className="banks sidebar-list">
                <ul className="bank-details">{ banks }</ul>
            </div>
        );
    }
}

const Export = connect(state => {
    return {
        accesses: get.accesses(state),
        active: get.currentAccessId(state)
    };
})(BankListComponent);

export default Export;
