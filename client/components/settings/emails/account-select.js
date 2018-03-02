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
