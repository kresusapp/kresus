import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { translate as $t } from '../../helpers';
import { get } from '../../store';

import About from './about';
import BankList from './banks';
import LocaleSelector from './locale-selector';

const Menu = props => {
    let currentAccountId = props.match.params.currentAccountId;

    const determineSubsection = (section, defaultSubsection) => {
        if (props.match.params.section === section &&
            typeof props.match.params.subsection !== 'undefined') {
            return props.match.params.subsection;
        }
        return defaultSubsection;
    };

    // Dynamically the subsection in the menu
    const chartsSubsection = determineSubsection('charts', props.defaultChart);
    const settingsSubsection = determineSubsection('settings', 'accounts');

    return (
        <div
          id="kresus-menu"
          className="sidebar offcanvas-xs col-sm-3 col-xs-10">
            <div className="logo sidebar-light">
                <Link
                  to="/"
                  className="app-title">
                    { $t('client.KRESUS') }
                    <LocaleSelector />
                </Link>
            </div>

            <div className="banks-accounts-list">
                <BankList
                  currentAccountId={ currentAccountId }
                  location={ props.location }
                />
            </div>

            <div className="sidebar-section-list">
                <ul>
                    <li>
                        <NavLink
                          to={ `/reports/${currentAccountId}` }
                          activeClassName="active">
                            <i className="fa fa-briefcase" />
                            { $t('client.menu.reports') }
                        </NavLink>
                    </li>
                    <li >
                        <NavLink
                          to={ `/budget/${currentAccountId}` }
                          activeClassName="active">
                            <i className="fa fa-heartbeat" />
                            { $t('client.menu.budget') }
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                          to={ `/charts/${chartsSubsection}/${currentAccountId}` }
                          activeClassName={ 'active' }>
                            <i className="fa fa-line-chart" />
                            { $t('client.menu.charts') }
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                          to={ `/duplicates/${currentAccountId}` }
                          activeClassName="active">
                            <i className="fa fa-clone" />
                            { $t('client.menu.similarities') }
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                          to={ `/categories/${currentAccountId}` }
                          activeClassName="active">
                            <i className="fa fa-list-ul" />
                            { $t('client.menu.categories') }
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                          to={ `/settings/${settingsSubsection}/${currentAccountId}` }
                          activeClassName="active">
                            <i className="fa fa-cogs" />
                            { $t('client.menu.settings') }
                        </NavLink>
                    </li>
                    <li>
                        <a
                          href="https://kresus.org/faq.html"
                          target="_blank"
                          rel="noopener noreferrer">
                            <i className="fa fa-question" />
                            { $t('client.menu.support') }
                        </a>
                    </li>
                </ul>
            </div>

            <div className="sidebar-about">
                <About />
            </div>
        </div>
    );
};

Menu.propTypes = {
    // The kind of chart to display: by categories, balance, or in and outs for all accounts.
    defaultChart: React.PropTypes.string.isRequired,
};

const Export = connect(state => {
    return {
        defaultChart: get.setting(state, 'defaultChartDisplayType')
    };
})(Menu);

export default Export;
