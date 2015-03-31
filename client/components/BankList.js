// Constants
import Events from '../Events';
import {debug, translate as t} from '../Helpers';

// Global variables
import store from '../store';
import flux from '../flux/dispatcher';

// Props: bank: Bank
class BankListItemComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    onClick() {
        flux.dispatch({
            type: Events.user.selected_bank,
            bankId: this.props.bank.id
        });
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
    }

    bankListListener() {
        this.setState({
            active: store.getCurrentBankId(),
            banks: store.getBanks()
        });
    }

    componentDidMount() {
        store.on(Events.state.banks, this.bankListListener.bind(this));
    }

    componentWillUnmount() {
        store.removeListener(Events.state.banks, this.bankListListener.bind(this));
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
