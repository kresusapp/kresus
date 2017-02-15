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
        let currentAccountId = this.props.currentAccountId;
        let banks = this.props.accesses.map(access => {
            let active = this.props.currentAccessId === access.id;
            return (
                <BankListItemComponent
                  key={ access.id }
                  access={ access }
                  currentAccountId={ currentAccountId }
                  active={ active }
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

const Export = connect((state, oldProps) => {
    let currentAccessId = get.accessByAccountId(state, oldProps.currentAccountId).id;
    return {
        accesses: get.accesses(state),
        currentAccessId
    };
})(BankListComponent);

export default Export;
