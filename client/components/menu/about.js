import React from 'react';

import { translate as $t } from '../../helpers';
import packageConfig from '../../../package.json';

class AboutComponent extends React.Component {
    render() {
        return (
            <React.Fragment>
                <a href="https://kresus.org">KRESUS</a>&nbsp;
                {packageConfig.version}&nbsp;
                <a
                    href="https://framagit.org/bnjbvr/kresus/blob/master/LICENSE"
                    rel="noopener noreferrer"
                    target="_blank">
                    {$t('client.about.license', {
                        license: packageConfig.license
                    })}
                </a>
            </React.Fragment>
        );
    }
}

export default AboutComponent;
