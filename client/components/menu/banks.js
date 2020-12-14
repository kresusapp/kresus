import React from 'react';
import { connect } from 'react-redux';

import { get } from '../../store';
import BankListItemComponent from './bank';
import withCurrentAccountId from '../withCurrentAccountId';

import './banks.css';

const BankListComponent = withCurrentAccountId(
    connect((state, oldProps) => {
        let currentAccessId =
            oldProps.currentAccountId !== null
                ? get.accessByAccountId(state, oldProps.currentAccountId).id
                : null;

        return {
            accessIds: get.accessIds(state),
            currentAccessId,
        };
    })(props => {
        let { currentAccessId, currentAccountId } = props;
        let banks = props.accessIds.map(accessId => {
            let isActive = currentAccessId === accessId;
            return (
                <BankListItemComponent
                    key={accessId}
                    accessId={accessId}
                    active={isActive}
                    currentAccountId={currentAccountId}
                />
            );
        });

        return <ul className="bank-details">{banks}</ul>;
    })
);

export default BankListComponent;
