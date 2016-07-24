import React from 'react';
import { connect } from 'react-redux';

import { get } from '../../store';

import NewBankForm from '../shared/add-bank-form';

import BankAccountsItem from './bank-accounts-item';

export default connect(state => {
    return {
        accesses: get.accesses(state)
    };
}, () => {
    // No dispatch
    return {};
})(props => {
    let accesses = props.accesses.map(access =>
        <BankAccountsItem key={ access.id } access={ access } />
    );
    return (
        <div>
            <NewBankForm expanded={ false } />
            <div>
                { accesses }
            </div>
        </div>
    );
});
