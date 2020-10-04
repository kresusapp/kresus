import React from 'react';
import { connect } from 'react-redux';
import { NavLink, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

import URL from '../../urls';
import { getDriver, drivers, noDriver } from '../drivers';
import { assert, translate as $t } from '../../helpers';
import { DEFAULT_CHART_DISPLAY_TYPE } from '../../../shared/settings';
import { get, actions } from '../../store';
import { findRedundantPairs } from '../duplicates';

import About from './about';
import BankList from './banks';
import { OverallTotalBalance } from '../ui/accumulated-balances';
import DisplayIf from '../ui/display-if';
import './menu.css';

const Entry = connect(
    state => ({ isSmallScreen: get.isSmallScreen(state) }),
    dispatch => {
        return {
            hideMenu() {
                actions.toggleMenu(dispatch, true);
            },
        };
    }
)(props => {
    let { className = '', isSmallScreen } = props;
    let handeHideMenu = isSmallScreen ? props.hideMenu : null;
    return (
        <li className={className} onClick={handeHideMenu}>
            <NavLink to={props.path} activeClassName="active">
                <i className={`fa fa-${props.icon}`} />
                {props.children}
            </NavLink>
        </li>
    );
});

Entry.propTypes = {
    // The path to which the link directs.
    path: PropTypes.string.isRequired,

    // Icon to be displayed.
    icon: PropTypes.string.isRequired,

    // The class name to apply to the li.
    className: PropTypes.string,
};

const DuplicatesEntry = connect((state, props) => {
    const { driver } = props;
    assert(driver.type === drivers.ACCOUNT, 'duplicates can only be displaid on Account view');
    return {
        numDuplicates: findRedundantPairs(state, driver.currentAccountId).length,
    };
})(props => {
    let { driver, numDuplicates } = props;
    return (
        <Entry path={URL.duplicates.url(driver)} icon="clone" className="duplicates">
            <span>{$t('client.menu.duplicates')}</span>
            <DisplayIf condition={numDuplicates > 0}>
                <span className="badge">{numDuplicates}</span>
            </DisplayIf>
        </Entry>
    );
});

const AccountSubMenu = connect(state => {
    return {
        defaultChart: get.setting(state, DEFAULT_CHART_DISPLAY_TYPE),
    };
})(props => {
    let { driver, value, section, subsection = props.defaultChart } = useParams();
    let currentDriver = getDriver(driver, value);
    return currentDriver === noDriver ? null : (
        <DisplayIf condition={currentDriver.config.showSubMenu}>
            <ul className="sidebar-section-list">
                <Entry path={URL.reports.url(currentDriver)} icon="briefcase">
                    <span>{$t('client.menu.reports')}</span>
                </Entry>
                <DisplayIf condition={currentDriver.config.showBudget}>
                    <Entry path={URL.budgets.url(currentDriver)} icon="heartbeat">
                        <span>{$t('client.menu.budget')}</span>
                    </Entry>
                </DisplayIf>
                <Entry path={URL.charts.url(subsection, currentDriver)} icon="line-chart">
                    <span>{$t('client.menu.charts')}</span>
                </Entry>
                <DisplayIf condition={currentDriver.config.showDuplicates}>
                    <DuplicatesEntry driver={currentDriver} section={section} />
                </DisplayIf>
            </ul>
        </DisplayIf>
    );
});

const Menu = connect(state => {
    return {
        isHidden: get.isMenuHidden(state),
    };
})(props => {
    return (
        <nav className={props.isHidden ? 'menu-hidden' : ''}>
            <OverallTotalBalance
                className="bank-details bank-total-accesses"
                isCurrencyLink={true}
            />

            <BankList />

            <AccountSubMenu />

            <div className="sidebar-about">
                <About />
            </div>
        </nav>
    );
});

export default Menu;
