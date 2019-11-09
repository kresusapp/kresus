import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { actions } from '../../store';
import { translate as $t } from '../../helpers';

import URL from '../../urls';

const BASE_PATH = URL.initialize.url();

const Demo = connect(
    null,
    dispatch => {
        return {
            handleEnableDemoMode() {
                actions.enableDemoMode(dispatch);
            }
        };
    }
)(props => {
    return (
        <div>
            <header>
                <h1>{$t('client.demo.title')}</h1>
            </header>

            <p>{$t('client.demo.description')}</p>

            <p className="buttons-toolbar">
                <Link className="btn danger" to={BASE_PATH}>
                    {$t('client.general.cancel')}
                </Link>

                <button type="button" className="btn primary" onClick={props.handleEnableDemoMode}>
                    {$t('client.general.continue')}
                </button>
            </p>
        </div>
    );
});

export default Demo;
