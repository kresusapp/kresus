import React from 'react';
import { connect } from 'react-redux';

import { get } from '../../store';
import BankListItemComponent from './bank';

const BankListComponent = props => {

    let banks = props.accesses.map(access => {
        let isActive = props.active === access.id;
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
};

BankListComponent.propTypes = {
    // The list of bank accesses
    accesses: React.PropTypes.array.isRequired,

    // The id of the current access
    active: React.PropTypes.string.isRequired
};

const Export = connect(state => {
    return {
        accesses: get.accesses(state),
        active: get.currentAccessId(state)
    };
})(BankListComponent);

export default Export;
