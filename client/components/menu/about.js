import React from 'react';

import { translate as $t } from '../../helpers';
import packageConfig from '../../../package.json';

class AboutComponent extends React.Component {
    render() {
        return (
            <div>
                <p className="sidebar-about-main" onClick={this.handleClick}>
                    <a href="https://kresus.org">KRESUS</a>&nbsp;
                    {packageConfig.version}&nbsp;
                    {$t('client.menu.about.license')}&nbsp;
                    <a
                        href="https://framagit.org/bnjbvr/kresus/blob/master/LICENSE"
                        rel="noopener noreferrer"
                        target="_blank">
                        {packageConfig.license}
                    </a>
                </p>
            </div>
        );
    }
}

export default AboutComponent;
