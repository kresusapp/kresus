import { store } from '../../store';

export default class AccountSelector extends React.Component {

    value() {
        return this.refs.selector.getDOMNode().value;
    }

    render() {
        let banks = store.getBanks();
        let accounts = [];
        for (let b of banks) {
            for (let a of store.getBankAccounts(b.id)) {
                accounts.push([a.accountNumber, `${b.name} - ${a.title}`]);
            }
        }

        let options = accounts.map(pair => <option value={pair[0]}>{pair[1]}</option>);

        return (
        <select className="form-control" ref="selector">
            {options}
        </select>
        );
    }
}
