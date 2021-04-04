import React from 'react';

import { get } from '../../store';

import { translate as $t, MIN_WOOB_VERSION as minVersion, useKresusState } from '../../helpers';

import ExternalLink from '../ui/external-link';
import LocaleSelector from '../settings/customization/locale-selector';

export default () => {
    const version = useKresusState(state => get.woobVersion(state));
    const installedText = version
        ? $t('client.woobinstallreadme.working_version', { version })
        : $t('client.woobinstallreadme.not_working');
    return (
        <div>
            <header>
                <h1>{$t('client.woobinstallreadme.title', { minVersion })}</h1>
                <LocaleSelector />
            </header>
            <div>
                {$t('client.woobinstallreadme.content', { minVersion, installedText })}&nbsp;
                <ExternalLink href={'https://kresus.org/install.html'}>
                    {$t('client.woobinstallreadme.link')} <i className="fa fa-external-link" />
                </ExternalLink>
            </div>
        </div>
    );
};
