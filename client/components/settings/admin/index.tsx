import React from 'react';

import { getCurrentUser } from '../../../store/global';
import { translate as $t } from '../../../helpers';
import DisplayIf from '../../ui/display-if';
import Woob from './woob';
import Logs from './logs';

export default () => {
    const currentUser = getCurrentUser();

    return (
        <React.Fragment>
            <div>
                <h2>{$t('client.settings.admin_connectors')}</h2>
                <Woob />
            </div>
            <DisplayIf condition={currentUser ? currentUser.isAdmin : false}>
                <hr />
                <div>
                    <h2>{$t('client.settings.admin_logs')}</h2>
                    <Logs />
                </div>
            </DisplayIf>
        </React.Fragment>
    );
};
