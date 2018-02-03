import React from 'react';
import { connect } from 'react-redux';

import { get } from '../../../store';

import BankAccessItem from './item';
import NewBankForm from './form';

export default connect(state => {
    return {
        accesses: get.accesses(state)
    };
})(props => {
    let accesses = props.accesses.map(id => <BankAccessItem key={id} accessId={id} />);
    return (
        <div key="bank-accesses-section">
            <NewBankForm expanded={false} />
            <div>{accesses}</div>
        </div>
    );
});
