import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { NavLink, useParams } from 'react-router-dom';

import URL from '../../urls';
import { getDriver, Driver, DriverType } from '../drivers';
import { assert, translate as $t, useKresusState } from '../../helpers';
import { get, actions } from '../../store';
import { findRedundantPairs } from '../duplicates';
import { OverallTotalBalance } from '../ui/accumulated-balances';
import DisplayIf from '../ui/display-if';

import About from './about';
import AccessList from './access-list';

import './menu.css';

interface EntryProps {
    // The path to which the link directs.
    path: string;

    // Icon to be displayed.
    icon: string;

    // The class name to apply to the li.
    className?: string;

    children: React.ReactNode[] | React.ReactNode;
}

const Entry = (props: EntryProps) => {
    const isSmallScreen = useKresusState(state => get.isSmallScreen(state));

    const dispatch = useDispatch();
    const hideMenu = useCallback(() => {
        actions.toggleMenu(dispatch, true);
    }, [dispatch]);

    const { className = '' } = props;
    const handeHideMenu = isSmallScreen ? hideMenu : undefined;

    return (
        <li className={className} onClick={handeHideMenu}>
            <NavLink to={props.path} activeClassName="active">
                <i className={`fa fa-${props.icon}`} />
                {props.children}
            </NavLink>
        </li>
    );
};

Entry.displayName = 'Entry';

const DuplicatesEntry = (props: { driver: Driver }) => {
    const { driver } = props;

    assert(driver.type === DriverType.Account, 'duplicates can only be displayed on Account view');
    assert(driver.currentAccountId !== null, 'thus we must have an account id');

    const numDuplicates = useKresusState(state => {
        const accountId = driver.currentAccountId;
        assert(accountId !== null, 'must have an account to compute duplicates');
        return findRedundantPairs(state, accountId).length;
    });

    return (
        <Entry path={URL.duplicates.url(driver)} icon="clone" className="duplicates">
            <span>{$t('client.menu.duplicates')}</span>
            <DisplayIf condition={numDuplicates > 0}>
                <span className="badge">{numDuplicates}</span>
            </DisplayIf>
        </Entry>
    );
};

DuplicatesEntry.displayName = 'DuplicatesEntry';

const AccountSubMenu = (props: { driver: Driver }) => {
    const { driver } = props;

    if (driver.type === DriverType.None) {
        return null;
    }

    return (
        <ul className="sidebar-section-list">
            <Entry path={URL.reports.url(driver)} icon="briefcase">
                <span>{$t('client.menu.reports')}</span>
            </Entry>

            <DisplayIf condition={driver.config.showBudget}>
                <Entry path={URL.budgets.url(driver)} icon="heartbeat">
                    <span>{$t('client.menu.budget')}</span>
                </Entry>
            </DisplayIf>

            <Entry path={URL.charts.urlBase(driver)} icon="line-chart">
                <span>{$t('client.menu.charts')}</span>
            </Entry>

            <Entry path={URL.recurringTransactions.url(driver)} icon="calendar">
                <span>{$t('client.recurring_transactions.title')}</span>
            </Entry>

            <DisplayIf condition={driver.config.showDuplicates}>
                <DuplicatesEntry driver={driver} />
            </DisplayIf>
        </ul>
    );
};

AccountSubMenu.displayName = 'AccountSubMenu';

const Menu = () => {
    const isHidden = useKresusState(state => get.isMenuHidden(state));

    const { driver: driverType = DriverType.None, value } = useParams<{
        driver: string;
        value: string;
        subsection: string;
    }>();

    const driver = getDriver(driverType, value);

    return (
        <nav className={isHidden ? 'menu-hidden' : ''}>
            <OverallTotalBalance
                className="bank-details bank-total-accesses"
                isCurrencyLink={true}
            />

            <AccessList driver={driver} />

            <AccountSubMenu driver={driver} />

            <div className="sidebar-about">
                <About />
            </div>
        </nav>
    );
};

Menu.displayName = 'Menu';

export default Menu;
