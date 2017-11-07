import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import { get } from '../../../store';

const AccountSelector = connect((state, props) => {
    // TODO move this into store/banks?
    let pairs = [];
    for (let access of get.accesses(state)) {
        let accounts = get.accountsByAccessId(state, access.id);
        for (let account of accounts) {
            pairs.push({
                key: account.accountNumber,
                val: `${access.name} − ${account.title}`
            });
        }
    }

    return {
        pairs,
        onChange(event) {
            props.onChange(event.target.value);
        }
    };
})(props => {
    let options = props.pairs.map(pair => (
        <option key={pair.key} value={pair.key}>
            {pair.val}
        </option>
    ));
    return (
        <select className="form-control" onChange={props.onChange}>
            {options}
        </select>
    );
});

AccountSelector.propTypes = {
    // A function to be called when the select is changed
    onChange: PropTypes.func.isRequired
};

export default AccountSelector;
