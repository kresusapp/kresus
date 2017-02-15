import React from 'react';
import { NavLink } from 'react-router-dom';

const AccountListItem = props => {
    let { account, location } = props;
    let total = props.balance;
    let color = total >= 0 ? 'positive' : 'negative';
    let currentPathname = location.pathname;
    let currentAccountId = props.currentAccountId;
    const isActive = () => {
        return currentAccountId === account.id;
    };
    let newPathname = currentPathname.replace(currentAccountId, account.id);

    return (
        <li
          key={ `account-details account-list-item-${account.id}` }>
            <div>
                <NavLink
                  to={ newPathname }
                  activeClassName='active'
                  isActive={ isActive }>
                    <span>
                        { account.title }
                    </span>
                    <span className={ `amount ${color}` }>
                        { account.formatCurrency(parseFloat(total.toFixed(2))) }
                    </span>
                </NavLink>
            </div>
        </li>
    );
};

AccountListItem.propTypes = {
    // the account object
    account: React.PropTypes.object.isRequired,

    // the account balance
    balance: React.PropTypes.number,

    // The location object containing the current path.
    // Needed to rerender the accounts links on route change
    location: React.PropTypes.object.isRequired
};

export default AccountListItem;
