import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { get } from '../../store';

import { areWeFunYet, translate as $t } from '../../helpers';
import ExternalLink from './external-link';
import DisplayIf from './display-if';

import './loading.css';

let showLicense = areWeFunYet();

export const LoadingMessage = props => {
    let message = props.message || $t('client.spinner.generic');

    return (
        <div className="loading-message">
            <h3>{$t('client.spinner.title')}</h3>
            <div>
                <svg
                    className="spinner"
                    width="11em"
                    height="11em"
                    viewBox="0 0 66 66"
                    xmlns="http://www.w3.org/2000/svg">
                    <circle
                        className="path"
                        fill="none"
                        strokeWidth="6"
                        strokeLinecap="round"
                        cx="33"
                        cy="33"
                        r="30"
                    />
                </svg>
                <div>{message}</div>
                <DisplayIf condition={showLicense}>
                    <div>
                        {$t('client.spinner.license')}
                        <ExternalLink href="https://liberapay.com/Kresus">Kresus</ExternalLink>
                    </div>
                </DisplayIf>
            </div>
        </div>
    );
};

LoadingMessage.propTypes = {
    // Message indicating why we're doing background loading (and the UI is
    // frozen).
    message: PropTypes.string,
};

export const LoadingOverlay = connect(state => {
    return {
        processingReason: get.backgroundProcessingReason(state),
    };
})(props => {
    if (!props.processingReason) {
        return null;
    }

    return (
        <div id="loading-overlay">
            <LoadingMessage message={$t(props.processingReason)} />
        </div>
    );
});
