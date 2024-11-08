import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import * as UiStore from '../../store/ui';
import * as GlobalStore from '../../store/global';
import { translate as $t, useKresusState } from '../../helpers';

import { Popconfirm } from '../ui';
import { useGenericError } from '../../hooks';
import { useHistory } from 'react-router-dom';
import URL from '../../urls';

export default () => {
    const isDemoMode = useKresusState(state => UiStore.isDemoMode(state.ui));
    const dispatch = useDispatch();
    const history = useHistory();
    const handleDisable = useGenericError(
        useCallback(async () => {
            // Bad Hack: Go to the about/ page before disabling demo mode. The
            // reason is that we might be on any Kresus section, since the
            // "disable demo mode" is shown in the header, and removing the
            // whole state may trigger zombie children assertions for any kind
            // of data pointed to by id. As a matter of fact, going to the
            // about/ page avoids this issue, since it displays no such data.
            //
            // Since we're redirecting before trying to disable demo mode, it's
            // not possible to redirect to the onboarding page *yet*: there's
            // another redirector in there, that would get us back to the
            // reports page, because we still have data.
            //
            // Redirecting after the action has been carried over is not
            // possible either: it would directly trigger the zombie child
            // assertions.
            //
            // In case of failure, revert back to the previous page.
            history.push(URL.about.url());

            try {
                await dispatch(GlobalStore.enableDemo(false)).unwrap();
            } catch (err) {
                history.goBack();
                throw err;
            }
        }, [history, dispatch])
    );

    if (!isDemoMode) {
        return null;
    }

    return (
        <Popconfirm
            trigger={
                <button type="reset" className="btn warning disable-demo-mode">
                    {$t('client.demo.disable')}
                </button>
            }
            onConfirm={handleDisable}
            confirmClass="warning">
            <p>{$t('client.demo.disable_warning')}</p>
        </Popconfirm>
    );
};
