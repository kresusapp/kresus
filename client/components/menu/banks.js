import { Actions, store, State } from '../../store';
import { has } from '../../helpers';

class BankActiveItemComponent extends React.Component {

    constructor(props) {
        has(props, 'bank');
        has(props, 'handleClick');
        super(props);
    }

    render() {
        return (
            <div className="bank-details">
                <div className={ `icon icon-${this.props.bank.uuid}` }></div>

                <div className="bank-name">
                    <a href="#" onClick={ this.props.handleClick }>
                        { this.props.bank.name }
                        <span className="caret"></span>
                    </a>
                </div>
            </div>
        );
    }
}

// Props: bank: Bank
class BankListItemComponent extends React.Component {

    constructor(props) {
        has(props, 'bank');
        has(props, 'active');
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        Actions.selectBank(this.props.bank);
    }

    render() {
        let maybeActive = this.props.active ? 'active' : '';
        return (
            <li className={ maybeActive }>
                <span>
                    <a href="#" onClick={ this.handleClick }>
                        { this.props.bank.name }
                    </a>
                </span>
            </li>
        );
    }
}

// State: [{name: bankName, id: bankId}]
export default class BankListComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            banks: store.getBanks(),
            active: store.getCurrentBankId(),
            showDropdown: false
        };
        this.listener = this.listener.bind(this);
        this.toggleDropdown = this.toggleDropdown.bind(this);
    }

    toggleDropdown(e) {
        this.setState({ showDropdown: !this.state.showDropdown });
        e.preventDefault();
    }

    listener() {
        this.setState({
            active: store.getCurrentBankId(),
            banks: store.getBanks()
        });
    }

    componentDidMount() {
        store.on(State.banks, this.listener);
    }

    componentWillUnmount() {
        store.removeListener(State.banks, this.listener);
    }

    render() {
        let active = this.state.banks.filter(bank =>
            this.state.active === bank.id
        ).map(bank =>
            <BankActiveItemComponent
              key={ bank.id }
              bank={ bank }
              handleClick={ this.toggleDropdown }
            />
        );

        let banks = this.state.banks.map(bank => {
            let isActive = this.state.active === bank.id;
            return (
                <BankListItemComponent key={ bank.id } bank={ bank } active={ isActive } />
            );
        });

        let menu = this.state.showDropdown ? '' : 'dropdown-menu';
        let dropdown = this.state.showDropdown ? 'dropup' : 'dropdown';

        return (
            <div className={ `banks sidebar-list ${dropdown}` }>
                { active }
                <ul className={ menu }>{ banks }</ul>
            </div>
        );
    }
}
