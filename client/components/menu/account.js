import React from 'react';
import { connect } from 'react-redux';

import { actions } from '../../store';

const AccountListItem = props => {
    let account = props.account;
    let total = props.balance;
    let color = total >= 0 ? 'positive' : 'negative';

    return (
        <li
          key={ `account-details account-list-item-${account.id}` }
          className={ props.active ? 'active' : '' }>
            <a
              href="#"
              onClick={ props.handleClick }>
                <span>
                    { account.title }
                </span>
                <span className={ `amount ${color}` }>
                    { account.formatCurrency(parseFloat(total.toFixed(2))) }
                </span>
            </a>
        </li>
    );
};

AccountListItem.propTypes = {
    // the account object
    account: React.PropTypes.object.isRequired,

    // the account balance
    balance: React.PropTypes.number,

    // Whether the account is the current account selected
    active: React.PropTypes.bool.isRequired
};

export default connect(null, (dispatch, props) => {
    return {
        handleClick: () => {
            actions.setCurrentAccountId(dispatch, props.account.id);
        }
    };
})(AccountListItem);
