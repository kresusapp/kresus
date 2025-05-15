import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { useKresusState, useKresusDispatch } from '../../../store';
import * as ViewsStore from '../../../store/views';
import { translate as $t } from '../../../helpers';

import URL from './urls';
import DisplayIf from '../../ui/display-if';
import { Popconfirm } from '../../ui';

import './views.css';

import type { View } from '../../../models';

const ViewItem = (props: { view: View }) => {
    const dispatch = useKresusDispatch();
    const { view } = props;

    const deleteView = useCallback(async () => {
        return dispatch(ViewsStore.destroy(view.id));
    }, [dispatch, view]);

    return (
        <tr key={view.id}>
            <td className="view-label">{view.label}</td>
            <td className="actions">
                <Link className="fa fa-pencil" to={URL.editView(view.id)} />
            </td>
            <td className="actions">
                <Popconfirm
                    onConfirm={deleteView}
                    trigger={
                        <button className="btn danger" aria-label="delete view">
                            <span className={'fa fa-trash'} />
                        </button>
                    }>
                    <p>{$t('client.settings.views.delete_confirmation', { label: view.label })}</p>
                </Popconfirm>
            </td>
        </tr>
    );
};

const ViewsList = () => {
    const views = useKresusState(state => ViewsStore.allUserViews(state.views));

    const viewsItems = views.map(view => <ViewItem key={view.id} view={view} />);

    return (
        <div className="views-section">
            <p className="top-toolbar">
                <Link className="btn primary" to={URL.newView}>
                    {$t('client.settings.views.new')}
                </Link>
            </p>
            <table className="no-vertical-border no-hover views-list">
                <caption>
                    <div>
                        <h3>{$t('client.settings.views.title')}</h3>
                    </div>
                </caption>
                <tbody>
                    <DisplayIf condition={views.length === 0}>
                        <tr>
                            <td colSpan={3}>{$t('client.settings.views.none')}</td>
                        </tr>
                    </DisplayIf>
                    {viewsItems}
                </tbody>
            </table>
        </div>
    );
};

ViewsList.displayName = 'ViewsList';

export default ViewsList;
