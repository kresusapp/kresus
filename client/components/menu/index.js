import React from 'react';
import { connect } from 'react-redux';
import { NavLink, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

import URL from '../../urls';
import { translate as $t } from '../../helpers';
import { DEFAULT_CHART_DISPLAY_TYPE } from '../../../shared/settings';
import { get, actions } from '../../store';
import { findRedundantPairs } from '../duplicates';

import About from './about';
import TotalBalance from './total-balance';
import BankList from './banks';
import DisplayIf from '../ui/display-if';

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
    const { currentAccountId } = props;
    return {
        numDuplicates: findRedundantPairs(state, currentAccountId).length,
    };
})(props => {
    let { currentAccountId, numDuplicates } = props;
    return (
        <Entry path={URL.duplicates.url(currentAccountId)} icon="clone" className="duplicates">
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
    let { currentAccountId = null, section, subsection = props.defaultChart } = useParams();

    return (
        <DisplayIf condition={currentAccountId !== null}>
            <ul className="sidebar-section-list">
                <Entry path={URL.reports.url(currentAccountId)} icon="briefcase">
                    <span>{$t('client.menu.reports')}</span>
                </Entry>
                <Entry path={URL.budgets.url(currentAccountId)} icon="heartbeat">
                    <span>{$t('client.menu.budget')}</span>
                </Entry>
                <Entry path={URL.charts.url(subsection, currentAccountId)} icon="line-chart">
                    <span>{$t('client.menu.charts')}</span>
                </Entry>
                <DuplicatesEntry currentAccountId={currentAccountId} section={section} />
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
            <TotalBalance />

            <BankList />

            <AccountSubMenu />

            <div className="sidebar-about">
                <About />
            </div>
        </nav>
    );
});

export default Menu;
