import { Fragment } from 'react';
import { translate as $t } from '../../../helpers';
import { getCurrentUser } from '../../../store/global';
import DisplayIf from '../../ui/display-if';
import Logs from './logs';
import Woob from './woob';

export default () => {
    const currentUser = getCurrentUser();

    return (
        <Fragment>
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
        </Fragment>
    );
};
