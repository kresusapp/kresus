import React from 'react';

import { get } from '../../store';

import { translate as $t, MIN_WEBOOB_VERSION as minVersion, useKresusState } from '../../helpers';

import ExternalLink from '../ui/external-link';
import LocaleSelector from '../settings/customization/locale-selector';

export default () => {
    const version = useKresusState(state => get.weboobVersion(state));
    const installedText = version
        ? $t('client.weboobinstallreadme.working_version', { version })
        : $t('client.weboobinstallreadme.not_working');
    return (
        <div>
            <header>
                <h1>{$t('client.weboobinstallreadme.title', { minVersion })}</h1>
                <LocaleSelector />
            </header>
            <div>
                {$t('client.weboobinstallreadme.content', { minVersion, installedText })}&nbsp;
                <ExternalLink href={'https://kresus.org/install.html'}>
                    {$t('client.weboobinstallreadme.link')} <i className="fa fa-external-link" />
                </ExternalLink>
            </div>
        </div>
    );
};
