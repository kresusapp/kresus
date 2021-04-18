import React from 'react';

import { translate as $t } from '../../../helpers';
import Woob from './woob';
import Logs from './logs';

export default () => {
    return (
        <React.Fragment>
            <div>
                <h2>{$t('client.settings.admin_connectors')}</h2>
                <Woob />
            </div>
            <hr />
            <div>
                <h2>{$t('client.settings.admin_logs')}</h2>
                <Logs />
            </div>
        </React.Fragment>
    );
};
