import React from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';

import { useKresusState } from '../../store';
import * as ViewsStore from '../../store/views';
import URL from '../../urls';
import { DriverAccount } from '../drivers/account';
import { DriverType } from '../drivers';
import { translate as $t } from '../../helpers';

const UserViewList = () => {
    const views = useKresusState(state => ViewsStore.allUserViews(state.views));
    const { pathname } = useLocation();
    const { driver = null, value } = useParams<{ driver?: string; value: string }>();

    const viewsItems = views.map(view => {
        const newPathname =
            driver !== null
                ? pathname.replace(driver, DriverType.Account).replace(value, view.id.toString())
                : URL.reports.url(new DriverAccount(view.id));

        return (
            <li key={`view-list-item-${view.id}`}>
                <NavLink to={newPathname} activeClassName="active">
                    <span>{view.label}</span>
                </NavLink>
            </li>
        );
    });

    let content = <p>{$t('client.settings.views.none')}</p>;

    if (viewsItems.length) {
        content = <ul className="views-list">{viewsItems}</ul>;
    }

    return (
        <div className="views-details">
            <h3>{$t('client.settings.views.title')}</h3>
            {content}
            <p>
                <NavLink to={URL.settings.url('views')}>
                    <span className="fa fa-cog" />
                    &nbsp;
                    <span>{$t('client.settings.views.manage')}</span>
                </NavLink>
            </p>
        </div>
    );
};

UserViewList.displayName = 'UserViewList';

export default UserViewList;
