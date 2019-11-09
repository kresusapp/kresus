import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { get } from '../../store';
import BankListItemComponent from './bank';

const BankListComponent = props => {
    let { currentAccessId, currentAccountId } = props;
    let banks = props.accessIds.map(accessId => {
        let isActive = currentAccessId === accessId;
        return (
            <BankListItemComponent
                key={accessId}
                accessId={accessId}
                active={isActive}
                location={props.location}
                match={props.match}
                currentAccountId={currentAccountId}
            />
        );
    });

    return <ul className="bank-details">{banks}</ul>;
};

BankListComponent.propTypes = {
    // The list of bank accesses ids
    accessIds: PropTypes.array.isRequired,

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
        accessIds: get.accessIds(state),
        currentAccessId
    };
})(BankListComponent);

export default Export;
