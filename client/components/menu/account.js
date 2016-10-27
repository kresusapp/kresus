import React from 'react';
import { connect } from 'react-redux';

import { actions } from '../../store';

class AccountListItem extends React.Component {

    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.props.handleClick(this.props.account);
    }

    render() {
        let account = this.props.account;
        let maybeActive = this.props.active ? 'active' : '';
        let total = this.props.balance;
        let color = total >= 0 ? 'positive' : 'negative';
        let formatCurrency = account.formatCurrency;

        return (
            <li key={ `account-details account-list-item-${account.id}` }
              className={ maybeActive }>
                <a href="#" onClick={ this.handleClick }>
                    <span>
                        { account.title }
                    </span>
                    <span className={ `amount ${color}` }>
                        { formatCurrency(total) }
                    </span>
                </a>
            </li>
        );
    }
}

AccountListItem.propTypes = {
};

const Export = connect(null, dispatch => {
    return {
        handleClick: account => {
            actions.setCurrentAccountId(dispatch, account.id);
        }
    };
})(AccountListItem);

export default Export;
