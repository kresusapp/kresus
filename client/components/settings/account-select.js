import React from 'react';

import { store } from '../../store';

export default class AccountSelector extends React.Component {

    value() {
        return this.refs.select.value;
    }

    render() {
        let banks = store.getBanks();
        let accounts = [];

        for (let b of banks) {
            for (let a of store.getBankAccounts(b.id)) {
                accounts.push({
                    key: a.accountNumber,
                    val: `${b.name} - ${a.title}`
                });
            }
        }

        let options = accounts.map(pair =>
            <option
              key={ pair.key }
              value={ pair.key }>
                { pair.val }
            </option>
        );

        return (
            <select className="form-control" ref="select">
                { options }
            </select>
        );
    }
}
