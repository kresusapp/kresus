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
    for (let dep of Object.keys(dependenciesLicenses).sort()) {
        let dependencyObject = dependenciesLicenses[dep];
        let maybeDepLink = <span className="link">{dep}</span>;
        if (dependencyObject.website) {
            maybeDepLink = (
                <a
                    key={dep}
                    href={dependencyObject.website}
                    rel="noopener noreferrer"
                    target="_blank">
                    {dep}
                </a>
            );
        }
        thanksItems.push(
            <p key={dep}>
                {maybeDepLink}
                <span className="license">
                    {$t('client.about.license', { license: dependencyObject.license })}
                </span>
            </p>
        );
    }

    return (
        <div className="about">
            <h3>{$t('client.about.resources')}</h3>
            <KresusDetails />

            <h3>{$t('client.about.thanks')}</h3>
            <p>{$t('client.about.thanks_description')}</p>
            <div className="grid">{thanksItems}</div>
        </div>
    );
};

export default About;
