import React from 'react';

import { translate as $t } from '../../helpers';

import dependenciesLicenses from './dependenciesLicenses.json';

const KresusDetails = () => {
    return (
        <div className="support-about">
            <p className="desc">{$t('client.about.description')}</p>

            <ul className="fa-ul">
                <li>
                    <span className="fa-li fa fa-home" />
                    <a href="https://kresus.org" rel="noopener noreferrer" target="_blank">
                        {$t('client.about.official_site')}
                    </a>
                </li>
                <li>
                    <span className="fa-li fa fa-pencil-square-o" />
                    <a href="https://kresus.org/blog/" rel="noopener noreferrer" target="_blank">
                        {$t('client.about.blog')}
                    </a>
                </li>
                <li>
                    <span className="fa-li fa fa-cloud" />
                    <a
                        href="https://community.kresus.org"
                        rel="noopener noreferrer"
                        target="_blank">
                        {$t('client.about.forum_thread')}
                    </a>
                </li>
                <li>
                    <span className="fa-li fa fa-comments" />
                    <a
                        href="https://webchat.freenode.net/?channels=%23kresus"
                        rel="noopener noreferrer"
                        target="_blank">
                        {$t('client.about.irc')}
                    </a>
                </li>
                <li>
                    <span className="fa-li fa fa-code" />
                    <a
                        href="https://framagit.org/bnjbvr/kresus"
                        rel="noopener noreferrer"
                        target="_blank">
                        {$t('client.about.sources')}
                    </a>
                </li>
                <li>
                    <span className="fa-li fa fa-question-circle" />
                    <a href="https://kresus.org/faq.html" rel="noopener noreferrer" target="_blank">
                        {$t('client.about.faq')}
                    </a>
                </li>
            </ul>
        </div>
    );
};

const About = () => {
    const pathPrefix = '/about';

    let menuItems = new Map();
    menuItems.set(`${pathPrefix}/accounts/`, $t('client.settings.tab_accounts'));

    let thanksItems = [];
    Object.keys(dependenciesLicenses)
        .sort()
        .forEach(dep => {
            let maybeDepLink = dep;
            if (dependenciesLicenses[dep].website) {
                maybeDepLink = (
                    <a
                        href={dependenciesLicenses[dep].website}
                        rel="noopener noreferrer"
                        target="_blank">
                        {dep}
                    </a>
                );
            }

            thanksItems.push(
                <li key={dep}>
                    {maybeDepLink} ({$t('client.about.license', {
                        license: dependenciesLicenses[dep].license
                    })})
                </li>
            );
        });

    return (
        <div className="top-panel panel panel-default">
            <div className="panel-heading">
                <h3 className="title panel-title">{$t('client.about.title')}</h3>
            </div>

            <div className="panel-body">
                <div>
                    <KresusDetails />
                </div>

                <h3>{$t('client.about.thanks')}</h3>
                <p>{$t('client.about.thanks_description')}</p>
                <ul>{thanksItems}</ul>
            </div>
        </div>
    );
};

export default About;
