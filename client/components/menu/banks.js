import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { get } from '../../store';
import BankListItemComponent from './bank';

const BankListComponent = props => {
    let { currentAccessId, currentAccountId } = props;
    let banks = props.accesses.map(access => {
        let isActive = currentAccessId === access.id;
        return (
            <BankListItemComponent
                key={access.id}
                access={access}
                active={isActive}
                location={props.location}
                currentAccountId={currentAccountId}
            />
        );
    });

    return (
        <div className="banks sidebar-list">
            <ul className="bank-details">{banks}</ul>
        </div>
    );
};

BankListComponent.propTypes = {
    // The list of bank accesses
    accesses: PropTypes.array.isRequired,

    // The id of the current access
    currentAccessId: PropTypes.string.isRequired,

    // The location object containing the current path.
    // Needed to rerender the accounts links on route change
    location: PropTypes.object.isRequired
};

const Export = connect((state, oldProps) => {
    let access = get.accessByAccountId(state, oldProps.currentAccountId);
    let currentAccessId = access !== null ? access.id : '';

    return {
        accesses: get.accesses(state),
        currentAccessId
    };
})(BankListComponent);

export default Export;
