import React from 'react';

import { translate as $t } from '../../helpers';

import ExternalLink from '../ui/external-link';

import dependencies from './dependenciesLicenses.json';

const AboutKresus = () => {
    return (
        <div className="support-about">
            <p className="desc">{$t('client.about.description')}</p>

            <ul>
                <li>
                    <span className="fa fa-home" />
                    <ExternalLink href="https://kresus.org">
                        {$t('client.about.official_site')}
                    </ExternalLink>
                </li>
                <li>
                    <span className="fa fa-pencil-square-o" />
                    <ExternalLink href="https://kresus.org/blog/">
                        {$t('client.about.blog')}
                    </ExternalLink>
                </li>
                <li>
                    <span className="fa fa-cloud" />
                    <ExternalLink href="https://community.kresus.org">
                        {$t('client.about.community')}
                    </ExternalLink>
                </li>
                <li>
                    <span className="fa fa-comments" />
                    <ExternalLink href="https://webchat.freenode.net/?channels=%23kresus">
                        {$t('client.about.irc')}
                    </ExternalLink>
                </li>
                <li>
                    <span className="fa fa-code" />
                    <ExternalLink href="https://framagit.org/bnjbvr/kresus">
                        {$t('client.about.sources')}
                    </ExternalLink>
                </li>
                <li>
                    <span className="fa fa-question-circle" />
                    <ExternalLink href="https://kresus.org/faq.html">
                        {$t('client.about.faq')}
                    </ExternalLink>
                </li>
            </ul>
        </div>
    );
};

const About = () => {
    let thanksItems = [];
    for (let dep of Object.keys(dependencies).sort()) {
        let dependency = dependencies[dep];
        let maybeDepLink = <span className="link">{dep}</span>;
        if (dependency.website) {
            maybeDepLink = (
                <ExternalLink key={dep} href={dependency.website}>
                    {dep}
                </ExternalLink>
            );
        }
        thanksItems.push(
            <p key={dep}>
                {maybeDepLink}
                <span className="license">
                    {$t('client.about.license', { license: dependency.license })}
                </span>
            </p>
        );
    }

    return (
        <div className="about">
            <h3>{$t('client.about.resources')}</h3>
            <AboutKresus />

            <h3>{$t('client.about.thanks')}</h3>
            <p>{$t('client.about.thanks_description')}</p>
            <div className="grid">{thanksItems}</div>
        </div>
    );
};

export default About;
