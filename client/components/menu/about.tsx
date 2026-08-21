import { Fragment } from 'react';
import { license, repository, version } from '../../../package.json';
import { translate as $t } from '../../helpers';
import ExternalLink from '../ui/external-link';

import './about.css';

const About = () => (
    <Fragment>
        <ExternalLink href="https://kresus.org">KRESUS</ExternalLink>&nbsp;
        {version}&nbsp;
        <ExternalLink href={`${repository.url}/blob/main/LICENSE`}>
            {$t('client.about.license', {
                license,
            })}
        </ExternalLink>
    </Fragment>
);

About.displayName = 'About';

export default About;
