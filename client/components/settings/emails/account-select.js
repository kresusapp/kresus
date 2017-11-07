import React from 'react';

import { connect } from 'react-redux';

import { get } from '../../../store';

const AccountSelector = connect(
    state => {
        // TODO move this into store/banks?
        let pairs = [];
        for (let access of get.accesses(state)) {
            let accounts = get.accountsByAccessId(state, access.id);
            for (let account of accounts) {
                pairs.push({
                    key: account.id,
                    val: `${access.name} − ${account.title}`
                });
            }
        }

        return {
            pairs
        };
    },
    null,
    null,
    { withRef: true }
)(
    class Selector extends React.Component {
        refSelector = node => {
            this.select = node;
        };
        value = () => {
            return this.select.value;
        };
        render() {
            let options = this.props.pairs.map(pair => (
                <option key={pair.key} value={pair.key}>
                    {pair.val}
                </option>
            ));
            return (
                <select ref={this.refSelector} className="form-element-block">
                    {options}
                </select>
            );
        }
    }
);

export default AccountSelector;
