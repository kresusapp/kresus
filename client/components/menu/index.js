import React from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { translate as $t } from '../../helpers';
import { get } from '../../store';

import About from './about';
import BankList from './banks';

const Menu = props => {
    let { currentAccountId } = props.match.params;

    const determineSubsection = (section, defaultSubsection) => {
        if (
            props.match.params.section === section &&
            typeof props.match.params.subsection !== 'undefined'
        ) {
            return props.match.params.subsection;
        }
        return defaultSubsection;
    };

    // Update the subsection in the links of the menu
    const chartsSubsection = determineSubsection('charts', props.defaultChart);
    const settingsSubsection = determineSubsection('settings', 'accounts');

    return (
        <nav className={props.isHidden ? 'menu-hidden' : ''}>
            <div className="banks-accounts-list">
                <BankList currentAccountId={currentAccountId} location={props.location} />
            </div>

            <div className="sidebar-section-list">
                <ul>
                    <li>
                        <NavLink to={`/reports/${currentAccountId}`} activeClassName="active">
                            <i className="fa fa-briefcase" />
                            {$t('client.menu.reports')}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={`/budget/${currentAccountId}`} activeClassName="active">
                            <i className="fa fa-heartbeat" />
                            {$t('client.menu.budget')}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to={`/charts/${chartsSubsection}/${currentAccountId}`}
                            activeClassName="active">
                            <i className="fa fa-line-chart" />
                            {$t('client.menu.charts')}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={`/duplicates/${currentAccountId}`} activeClassName="active">
                            <i className="fa fa-clone" />
                            {$t('client.menu.duplicates')}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={`/categories/${currentAccountId}`} activeClassName="active">
                            <i className="fa fa-list-ul" />
                            {$t('client.menu.categories')}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to={`/settings/${settingsSubsection}/${currentAccountId}`}
                            activeClassName="active">
                            <i className="fa fa-cogs" />
                            {$t('client.menu.settings')}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={`/support/${currentAccountId}`} activeClassName="active">
                            <i className="fa fa-question" />
                            {$t('client.menu.support')}
                        </NavLink>
                    </li>
                </ul>
            </div>

            <div className="sidebar-about">
                <About />
            </div>
        </nav>
    );
};

Menu.propTypes = {
    // The kind of chart to display: by categories, balance, or in and outs for all accounts.
    defaultChart: PropTypes.string.isRequired,
    // Tells whether the menu shall be shown or not
    isHidden: PropTypes.bool.isRequired
};

const Export = connect(state => {
    return {
        defaultChart: get.setting(state, 'defaultChartDisplayType')
    };
})(Menu);

export default Export;
