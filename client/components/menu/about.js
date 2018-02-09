import React from 'react';

import ExternalLink from '../ui/external-link';
import { translate as $t } from '../../helpers';
import packageConfig from '../../../package.json';

const AboutComponent = () => (
    <React.Fragment>
        <ExternalLink href="https://kresus.org">KRESUS</ExternalLink>&nbsp;
        {packageConfig.version}&nbsp;
        <ExternalLink href="https://framagit.org/bnjbvr/kresus/blob/master/LICENSE">
            {$t('client.about.license', {
                license: packageConfig.license
            })}
        </ExternalLink>
    </React.Fragment>
);

export default AboutComponent;
