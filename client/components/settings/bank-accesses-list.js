import React from 'react';
import { connect } from 'react-redux';

import { get } from '../../store';

import NewBankForm from '../shared/add-bank-form';

import BankAccessItem from './bank-accesses-item';

export default connect(state => {
    return {
        accesses: get.accesses(state)
    };
}, () => {
    // No dispatch
    return {};
})(props => {
    let accesses = props.accesses.map(access =>
        <BankAccessItem key={ access.id } access={ access } />
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
