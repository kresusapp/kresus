import React, { useCallback } from 'react';
import { NavLink, useParams } from 'react-router-dom';

import URL from '../../urls';
import { getDriver, Driver, DriverType } from '../drivers';
import { translate as $t } from '../../helpers';
import { useKresusDispatch, useKresusState } from '../../store';
import * as UiStore from '../../store/ui';
import { findRedundantPairs } from '../duplicates';
import { OverallTotalBalance } from '../ui/accumulated-balances';
import DisplayIf from '../ui/display-if';

import About from './about';
import AccessList from './access-list';
import UserViewList from './user-view-list';

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
    const isSmallScreen = useKresusState(state => UiStore.isSmallScreen(state.ui));

    const dispatch = useKresusDispatch();
    const hideMenu = useCallback(() => {
        dispatch(UiStore.toggleMenu(true));
    }, [dispatch]);

    const { className = '' } = props;
    const handleHideMenu = isSmallScreen ? hideMenu : undefined;

    return (
        <li className={className} onClick={handleHideMenu}>
            <NavLink to={props.path} activeClassName="active">
                <i className={`fa fa-${props.icon}`} />
                {props.children}
            </NavLink>
        </li>
    );
};

Entry.displayName = 'Entry';

const AccountSubMenu = (props: { driver: Driver }) => {
    const { driver } = props;

    const numDuplicates = useKresusState(state => {
        if (driver.type === DriverType.None) {
            return 0;
        }

        const accounts = driver.getAccounts(state);
        return accounts.map(account => findRedundantPairs(state, account.id)).flat().length;
    });

    if (driver.type === DriverType.None) {
        return null;
    }

    return (
        <ul className="sidebar-section-list">
            <Entry path={URL.reports.url(driver)} icon="briefcase">
                <span>{$t('client.menu.reports')}</span>
            </Entry>

            <DisplayIf condition={driver.type === DriverType.Account}>
                <Entry path={URL.budgets.url(driver)} icon="heartbeat">
                    <span>{$t('client.menu.budget')}</span>
                </Entry>
            </DisplayIf>

            <Entry path={URL.charts.urlBase(driver)} icon="line-chart">
                <span>{$t('client.menu.charts')}</span>
            </Entry>

            <Entry path={URL.duplicates.url(driver)} icon="clone" className="duplicates">
                <span>{$t('client.menu.duplicates')}</span>
                <DisplayIf condition={numDuplicates > 0}>
                    <span className="badge">{numDuplicates}</span>
                </DisplayIf>
            </Entry>
        </ul>
    );
};

AccountSubMenu.displayName = 'AccountSubMenu';

const Menu = () => {
    const isHidden = useKresusState(state => UiStore.isMenuHidden(state.ui));

    const { driver: driverType = DriverType.None, value } = useParams<{
        driver: string;
        value: string;
        subsection: string;
    }>();

    const driver = getDriver(driverType, value);

    return (
        <nav className={isHidden ? 'menu-hidden' : ''}>
            <OverallTotalBalance className="bank-total-accesses" isCurrencyLink={true} />

            <AccessList driver={driver} />

            <UserViewList />

            <AccountSubMenu driver={driver} />

            <div className="sidebar-about">
                <About />
            </div>
        </nav>
    );
};

Menu.displayName = 'Menu';

export default Menu;
