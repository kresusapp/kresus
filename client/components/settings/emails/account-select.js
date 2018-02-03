import React from 'react';
import { connect } from 'react-redux';

import { get } from '../../../store';

class AccountSelector extends React.Component {
    constructor(props) {
        super(props);

        this.selector = null;
    }

    value() {
        return this.selector.value;
    }

    render() {
        let options = this.props.pairs.map(pair => (
            <option key={pair.key} value={pair.key}>
                {pair.val}
            </option>
        ));

        let refSelector = selector => {
            this.selector = selector;
        };

        return (
            <select className="form-control" ref={refSelector}>
                {options}
            </select>
        );
    }
}

// Third argument to connect is "mergeProps", should be deleted once the TODO
// is solved.
export default connect(
    state => {
        // TODO move this into store/banks?
        let pairs = [];
        for (let accessId of get.accessIds(state)) {
            let accountIds = get.accountIdsByAccessId(state, accessId);
            let access = get.accessById(state, accessId);

            for (let accountId of accountIds) {
                let account = get.accountById(state, accountId);
                pairs.push({
                    key: account.accountNumber,
                    val: `${access.name} − ${account.title}`
                });
            }
        }

        return {
            pairs
        };
    },
    () => {
        return {};
    },
    null,
    {
        // TODO should not need this here (needed for getWrappedInstances() in
        // forms).
        withRef: true
    }
)(AccountSelector);
