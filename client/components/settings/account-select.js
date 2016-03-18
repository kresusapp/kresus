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
                accounts.push([a.accountNumber, `${b.name} - ${a.title}`]);
            }
        }

        let options = accounts.map(pair =>
            <option
              key={ pair[0] }
              value={ pair[0] }>
                { pair[1] }
            </option>
        );

        return (
            <select className="form-control" ref="select">
                { options }
            </select>
        );
    }
}
