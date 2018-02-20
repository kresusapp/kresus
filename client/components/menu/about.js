import React from 'react';

import { translate as $t } from '../../helpers';
import packageConfig from '../../../package.json';

export class KresusDetails extends React.Component {
    render() {
        return (
            <div>
                <p className="desc">{$t('client.about')}</p>

                <ul>
                    <li>
                        <a href="https://kresus.org" rel="noopener noreferrer" target="_blank">
                            {$t('client.menu.about.official_site')}
                            <span className="fa fa-home" />
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://kresus.org/blog/"
                            rel="noopener noreferrer"
                            target="_blank">
                            {$t('client.menu.about.blog')}
                            <span className="fa fa-pencil-square-o" />
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://community.kresus.org"
                            rel="noopener noreferrer"
                            target="_blank">
                            {$t('client.menu.about.forum_thread')}
                            <span className="fa fa-cloud" />
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://webchat.freenode.net/?channels=%23kresus"
                            rel="noopener noreferrer"
                            target="_blank">
                            {$t('client.menu.about.irc')}
                            <span className="fa fa-comments" />
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://framagit.org/bnjbvr/kresus"
                            rel="noopener noreferrer"
                            target="_blank">
                            {$t('client.menu.about.sources')}
                            <span className="fa fa-code" />
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://kresus.org/faq.html"
                            rel="noopener noreferrer"
                            target="_blank">
                            {$t('client.menu.about.faq')}
                            <span className="fa fa-question-circle" />
                        </a>
                    </li>
                </ul>
            </div>
        );
    }
}

class AboutComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showDetails: false
        };

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        if (e.target.tagName !== 'A') {
            this.setState({
                showDetails: !this.state.showDetails
            });
        }
    }

    render() {
        let details;

        if (this.state.showDetails) {
            details = (
                <KresusDetails />
            );
        }

        let toggleSpan = this.state.showDetails ? 'down' : 'up';

        return (
            <div>
                <p className="sidebar-about-main" onClick={this.handleClick}>
                    <span className={`toggle fa fa-angle-${toggleSpan}`} />
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

                {details}
            </div>
        );
    }
}

export default AboutComponent;
