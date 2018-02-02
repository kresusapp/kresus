import React from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';

import { translate as $t } from '../../helpers';
import { get } from '../../store';
import { findRedundantPairs } from '../duplicates';

import About from './about';
import BankList from './banks';

// Prevent recalculation of the duplicates number at each update of url.
const duplicatesNumberSelector = createSelector(
    (state, currentAccountId) => get.operationsByAccountId(state, currentAccountId),
    state => get.setting(state, 'duplicateThreshold'),
    (ops, threshold) => findRedundantPairs(ops, threshold).length
);

const Entry = props => {
    let { className = '' } = props;
    return (
        <li className={className}>
            <NavLink to={props.path} activeClassName="active">
                <i className={`fa fa-${props.icon}`} />
                {props.children}
            </NavLink>
        </li>
    );
};

Entry.propTypes = {
    // The path to which the link directs.
    path: PropTypes.string.isRequired,

    // Icon to be displayed.
    icon: PropTypes.string.isRequired,

    // The class name to apply to the li.
    className: PropTypes.string
};

const DuplicatesEntry = connect((state, props) => {
    const { currentAccountId } = props;
    return {
        numDuplicates: duplicatesNumberSelector(state, currentAccountId)
    };
})(props => {
    let { currentAccountId, numDuplicates } = props;
    // Do not display the badge if there are no duplicates.
    const badge = numDuplicates ? <span className="badge">{numDuplicates}</span> : null;

    return (
        <Entry path={`/duplicates/${currentAccountId}`} icon="clone" className="duplicates">
            <span>{$t('client.menu.duplicates')}</span>
            {badge}
        </Entry>
    );
});

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
                    <Entry path={`/reports/${currentAccountId}`} icon="briefcase">
                        <span>{$t('client.menu.reports')}</span>
                    </Entry>
                    <Entry path={`/budget/${currentAccountId}`} icon="heartbeat">
                        <span>{$t('client.menu.budget')}</span>
                    </Entry>
                    <Entry
                        path={`/charts/${chartsSubsection}/${currentAccountId}`}
                        icon="line-chart">
                        <span>{$t('client.menu.charts')}</span>
                    </Entry>
                    {/* Pass down the location so that the active class is set
                    when changing of location */}
                    <DuplicatesEntry
                        currentAccountId={currentAccountId}
                        location={props.location}
                    />
                    <Entry path={`/categories/${currentAccountId}`} icon="list-ul">
                        {$t('client.menu.categories')}
                    </Entry>
                    <Entry path={`/settings/${settingsSubsection}/${currentAccountId}`} icon="cogs">
                        {$t('client.menu.settings')}
                    </Entry>
                    <Entry path={`/about/${currentAccountId}`} icon="question">
                        {$t('client.menu.about')}
                    </Entry>
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
