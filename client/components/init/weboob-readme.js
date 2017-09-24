import React from 'react';

import { translate as $t } from '../../helpers';
import { MIN_WEBOOB_VERSION as version } from '../../../shared/helpers';

export default () => (
    <div>
        <h1>
            { $t('client.weboobinstallreadme.title', { version }) }
        </h1>
        <div className="well">
            { $t('client.weboobinstallreadme.content', { version }) }
            <a href="https://framagit.org/bnjbvr/kresus/blob/master/README.md">README</a>.
        </div>
    </div>
);
