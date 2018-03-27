import React from 'react';
import PropTypes from 'prop-types';

import { areWeFunYet, translate as $t } from '../../helpers';
import ExternalLink from './external-link.js';

let showLicense = areWeFunYet();

const LoadingMessage = props => {
    let message = props.message || $t('client.spinner.generic');

    let license = showLicense ? (
        <div>
            {$t('client.spinner.license')}
            <ExternalLink href="https://liberapay.com/Kresus">Kresus</ExternalLink>
        </div>
    ) : null;

    return (
        <div className="row">
            <div className="col-xs-12 col-sm-6 col-sm-offset-3">
                <div className="top-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="text-center">{$t('client.spinner.title')}</h3>
                    </div>
                    <div className="panel-body text-center">
                        <div className="spinner" />
                        <div>{message}</div>
                        {license}
                    </div>
                </div>
            </div>
        </div>
    );
};

LoadingMessage.propTypes = {
    // Message indicating why we're doing background loading (and the UI is
    // frozen).
    message: PropTypes.string
};

export default LoadingMessage;
