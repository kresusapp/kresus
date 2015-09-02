// Constants
import T from './Translated';

// Constants
import {has} from '../Helpers';

// Global variables
import {Actions, store, State} from '../store';

// Props: bank: Bank
class BankActiveItem extends React.Component {

    constructor(props) {
        has(props, 'toggleDropdown');
        super(props);
    }

    render() {
        return (
            <div className="bank-details">
                <div className={ "thumb thumb-" + this.props.bank.uuid }></div>
                
                <a href="#" onClick={this.props.toggleDropdown}>
                    {this.props.bank.name}
                    <span className="caret"></span>
                </a>
            </div>
        );
    }
}

// Props: bank: Bank
class BankListItem extends React.Component {

    constructor(props) {
        super(props);
    }

    onClick() {
        Actions.SelectBank(this.props.bank);
    }
    
    render() {
        var maybeActive = this.props.active ? "active" : "";
        return (
            <li className={maybeActive}><span><a href="#" onClick={this.onClick.bind(this)}>{this.props.bank.name}</a></span></li>
        );
    }
}

// State: [{name: bankName, id: bankId}]
export default class BankListComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            banks: [],
            showDropdown: false
        };
        this.listener = this._listener.bind(this);
    }
    
    toggleDropdown(e) {
        this.setState({ showDropdown: !this.state.showDropdown});
        e.preventDefault();
    }

    _listener() {
        this.setState({
            active: store.getCurrentBankId(),
            banks: store.getBanks()
        });
    }

    componentDidMount() {
        store.subscribeMaybeGet(State.banks, this.listener);
    }

    componentWillUnmount() {
        store.removeListener(State.banks, this.listener);
    }

    render() {
        var active = this.state.banks.filter((bank) => {
            return this.state.active == bank.id;
        }).map((bank) => {
            return (
                <BankActiveItem key={bank.id} bank={bank} 
                    toggleDropdown={this.toggleDropdown.bind(this)}/>
            );
        });
        
        var banks = this.state.banks.map((bank) => {
            var active = this.state.active == bank.id;
            return (
                <BankListItem key={bank.id} bank={bank} active={active} />
            );
        });

        var maybeOpen = this.state.showDropdown ? "open" : "";
        
        return (
            <div className="banks sidebar-list">
                {active}
                
                <ul className={ "dropdown " + maybeOpen }>
                    {banks}
                </ul>
            </div>
        );
    }
}
