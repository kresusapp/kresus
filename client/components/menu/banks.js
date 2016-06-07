import React from 'react';
import { connect } from 'react-redux';

import { Actions, store, State } from '../../store';
import * as Ui from '../../store/ui';
import { has } from '../../helpers';

let BankActiveItemComponent = props => (
    <div className="bank-details">
        <div className={ `icon icon-${props.bank.uuid}` }></div>

        <div className="bank-name">
            <a href="#" onClick={ props.handleClick }>
                { props.bank.name }
                <span className="caret"></span>
            </a>
        </div>
    </div>
);

let BankListItemComponent = connect(state => {
    return {};
}, dispatch => {
    return {
        handleClick: bank => {
            // TODO use dispatch directly
            Actions.selectBank(bank);
        }
    }
})(props => {
    let maybeActive = props.active ? 'active' : '';
    return (
        <li className={ maybeActive }>
            <span>
                <a href="#" onClick={ () => props.handleClick(props.bank) }>
                    { props.bank.name }
                </a>
            </span>
        </li>
    );
});

// State: [{name: bankName, id: bankId}]
class BankListComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            banks: store.getBanks(),
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
            this.props.active === bank.id
        ).map(bank =>
            <BankActiveItemComponent
              key={ bank.id }
              bank={ bank }
              handleClick={ this.toggleDropdown }
            />
        );

        let banks = this.state.banks.map(bank => {
            let isActive = this.props.active === bank.id;
            return (
                <BankListItemComponent
                  key={ bank.id }
                  bank={ bank }
                  active={ isActive }
                />
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

const Export = connect(state => {
    return {
        // TODO find a better way to not leak state.ui, etc;
        active: Ui.getCurrentBankId(state.ui),
    };
}, () => {
    // No actions.
    return {};
})(BankListComponent);

export default Export;
