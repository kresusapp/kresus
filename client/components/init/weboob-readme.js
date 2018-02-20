import React from 'react';
import { connect } from 'react-redux';

import { get } from '../../store';

import { translate as $t, MIN_WEBOOB_VERSION as minVersion } from '../../helpers';

import LocaleSelector from '../menu/locale-selector';

export default connect(state => {
    return {
        version: get.weboobVersion(state)
    };
})(props => {
    const { version } = props;
    const installedText = version
        ? $t('client.weboobinstallreadme.working_version', { version })
        : $t('client.weboobinstallreadme.not_working');
    return (
        <div>
            <header>
                <LocaleSelector />
                <h1>{$t('client.weboobinstallreadme.title', { minVersion })}</h1>
            </header>
            <div>
                {$t('client.weboobinstallreadme.content', { minVersion, installedText })}
                <a
                    href="https://framagit.org/bnjbvr/kresus/blob/master/README.md"
                    rel="noopener noreferrer"
                    target="_blank">
                    README <i className="fa fa-external-link" />
                </a>.
            </div>
        </div>
    );
});
