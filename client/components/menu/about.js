import React from 'react';

import ExternalLink from '../ui/external-link';
import { translate as $t } from '../../helpers';
import { version, repository, license } from '../../../package.json';

const AboutComponent = () => (
    <React.Fragment>
        <ExternalLink href="https://kresus.org">KRESUS</ExternalLink>&nbsp;
        {version}&nbsp;
        <ExternalLink href={`${repository.url}/blob/master/LICENSE`}>
            {$t('client.about.license', {
                license
            })}
        </ExternalLink>
    </React.Fragment>
);

export default AboutComponent;
