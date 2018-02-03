import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';

import { translate as $t } from '../../helpers';
import { get } from '../../store';
import { findRedundantPairs } from '../duplicates';

import About from './about';
import BankList from './banks';
import Entry from './entry';

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

    // Do not display the badge if there is no duplicates.
    const badge = props.duplicateNumber ? (
        <span className="badge pull-right">{props.duplicateNumber}</span>
    ) : null;

    return (
        <nav className={props.isHidden ? 'menu-hidden' : ''}>
            <div className="banks-accounts-list">
                <BankList currentAccountId={currentAccountId} location={props.location} />
            </div>

            <div className="sidebar-section-list">
                <ul>
                    <Entry path={`/reports/${currentAccountId}`} icon="briefcase">
                        {$t('client.menu.reports')}
                    </Entry>
                    <Entry path={`/budget/${currentAccountId}`} icon="heartbeat">
                        {$t('client.menu.budget')}
                    </Entry>
                    <Entry
                        path={`/charts/${chartsSubsection}/${currentAccountId}`}
                        icon="line-chart">
                        {$t('client.menu.charts')}
                    </Entry>
                    <Entry path={`/duplicates/${currentAccountId}`} icon="clone">
                        {$t('client.menu.duplicates')}
                        {badge}
                    </Entry>
                    <Entry path={`/categories/${currentAccountId}`} icon="list-ul">
                        {$t('client.menu.categories')}
                    </Entry>
                    <Entry path={`/settings/${settingsSubsection}/${currentAccountId}`} icon="cogs">
                        {$t('client.menu.settings')}
                    </Entry>
                    <li>
                        <a
                            href="https://kresus.org/faq.html"
                            target="_blank"
                            rel="noopener noreferrer">
                            <i className="fa fa-question" />
                            {$t('client.menu.support')}
                        </a>
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

// Prevent recalculation of the duplicates number at each update of url.
const duplicatesNumberSelector = createSelector(
    (state, currentAccountId) => get.operationsByAccountIds(state, currentAccountId),
    state => get.setting(state, 'duplicateThreshold'),
    (ops, threshold) => findRedundantPairs(ops, threshold).length
);

const Export = connect((state, props) => {
    const { currentAccountId } = props.match.params;
    return {
        duplicateNumber: duplicatesNumberSelector(state, currentAccountId),
        defaultChart: get.setting(state, 'defaultChartDisplayType')
    };
})(Menu);

export default Export;
