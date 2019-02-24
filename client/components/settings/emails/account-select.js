import React from 'react';
import { connect } from 'react-redux';

import { get } from '../../../store';
import { displayLabel } from '../../../helpers';

const AccountSelector = connect(state => {
    // TODO move this into store/banks?
    let pairs = [];
    for (let accessId of get.accessIds(state)) {
        let accountIds = get.accountIdsByAccessId(state, accessId);
        let access = get.accessById(state, accessId);

        for (let accountId of accountIds) {
            let account = get.accountById(state, accountId);
            pairs.push({
                key: account.id,
                val: `${displayLabel(access)} − ${displayLabel(account)}`
            });
        }
    }

    return {
        pairs
    };
})(
    class Selector extends React.Component {
        handleChange = event => {
            this.props.onChange(event.target.value);
        };

        componentDidMount() {
            if (!this.props.pairs.length) {
                return;
            }
            this.props.onChange(this.props.pairs[0].key);
        }

        render() {
            let options = this.props.pairs.map(pair => (
                <option key={pair.key} value={pair.key}>
                    {pair.val}
                </option>
            ));
            return (
                <select onChange={this.handleChange} className="form-element-block">
                    {options}
                </select>
            );
        }
    }
);

export default AccountSelector;
