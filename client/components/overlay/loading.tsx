import React from 'react';

import { translate as $t } from '../../helpers';

const LoadingMessage = (props: {
    // Message indicating why we're doing background loading (and the UI is
    // frozen).
    message?: string;
}) => {
    const message = props.message || $t('client.spinner.generic');

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
            </div>
        </div>
    );
};

LoadingMessage.displayName = 'LoadingMessage';

export default LoadingMessage;
