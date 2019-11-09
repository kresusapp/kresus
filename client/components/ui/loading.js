import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { get } from '../../store';

import { areWeFunYet, translate as $t } from '../../helpers';
import ExternalLink from './external-link';
import DisplayIf from './display-if';

let showLicense = areWeFunYet();

export const LoadingMessage = props => {
    let message = props.message || $t('client.spinner.generic');

    return (
        <div className="loading-message">
            <h3>{$t('client.spinner.title')}</h3>
            <div>
                <div className="spinner" />
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
    message: PropTypes.string
};

export const LoadingOverlay = connect(state => {
    return {
        processingReason: get.backgroundProcessingReason(state)
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
