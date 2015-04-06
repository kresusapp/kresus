// Constants
import Events from '../Events';
import {debug, translate as t} from '../Helpers';

// Global variables
import store from '../store';

// Props: bank: Bank
class BankListItemComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    onClick() {
        store.actions.SelectBank(this.props.bank);
    }

    render() {
        var maybeActive = this.props.active ? "active" : "";
        return (
            <li className={maybeActive}><span><a href="#" onClick={this.onClick.bind(this)}>{this.props.bank.name}</a></span></li>
        );
    }

};

// State: [{name: bankName, id: bankId}]
export default class BankListComponent extends React.Component {

    constructor() {
        this.state = {
            banks: []
        }
        this.listener = this._listener.bind(this);
    }

    _listener() {
        this.setState({
            active: store.getCurrentBankId(),
            banks: store.getBanks()
        });
    }

    componentDidMount() {
        store.on(Events.state.banks, this.listener);
    }

    componentWillUnmount() {
        store.removeListener(Events.state.banks, this.listener);
    }

    render() {
        var banks = this.state.banks.map((bank) => {
            var active = this.state.active == bank.id;
            return (
                <BankListItemComponent key={bank.id} bank={bank} active={active} />
            )
        });

        return (
            <div className="sidebar-list">
                <ul className="sidebar-sublist"><span className="topic">{t('Banks')}</span>
                    {banks}
                </ul>
            </div>
        );
    }
}
