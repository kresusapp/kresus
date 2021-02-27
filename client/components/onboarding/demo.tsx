import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import { actions } from '../../store';
import { translate as $t } from '../../helpers';

import URL from '../../urls';
import { useGenericError } from '../../hooks';
import { Form } from '../ui';

const BASE_PATH = URL.onboarding.url();

const Demo = () => {
    const dispatch = useDispatch();

    const handleEnableDemoMode = useGenericError(
        useCallback(() => actions.enableDemoMode(dispatch), [dispatch])
    );

    return (
        <div>
            <header>
                <h1>{$t('client.demo.title')}</h1>
            </header>

            <p>{$t('client.demo.description')}</p>

            <Form.Toolbar>
                <button type="button" className="btn primary" onClick={handleEnableDemoMode}>
                    {$t('client.general.continue')}
                </button>
                <Link className="btn danger" to={BASE_PATH}>
                    {$t('client.general.cancel')}
                </Link>
            </Form.Toolbar>
        </div>
    );
};

Demo.displayName = 'Demo';

export default Demo;
