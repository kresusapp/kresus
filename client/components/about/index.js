import React from 'react';

import { translate as $t } from '../../helpers';

import ExternalLink from '../ui/external-link';

import dependencies from './dependenciesLicenses.json';
import { repository } from '../../../package.json';

import LICENSE from 'raw-loader!../../../LICENSE';
import DisplayIf from '../ui/display-if';

const AboutKresus = () => {
    return (
        <div className="support-about">
            <p className="desc">{$t('client.about.description')}</p>

            <ul className="grid">
                <li>
                    <ExternalLink href="https://kresus.org">
                        <span className="fa fa-home" />
                        <span className="label">{$t('client.about.official_site')}</span>
                    </ExternalLink>
                </li>
                <li>
                    <ExternalLink href="https://kresus.org/blog/">
                        <span className="fa fa-pencil-square-o" />
                        <span className="label">{$t('client.about.blog')}</span>
                    </ExternalLink>
                </li>
                <li>
                    <ExternalLink href="https://community.kresus.org">
                        <span className="fa fa-cloud" />
                        <span className="label">{$t('client.about.community')}</span>
                    </ExternalLink>
                </li>
                <li>
                    <ExternalLink href="https://webchat.freenode.net/?channels=%23kresus">
                        <span className="fa fa-comments" />
                        <span className="label">{$t('client.about.irc')}</span>
                    </ExternalLink>
                </li>
                <li>
                    <ExternalLink href={repository.url}>
                        <span className="fa fa-code" />
                        <span className="label">{$t('client.about.sources')}</span>
                    </ExternalLink>
                </li>
                <li>
                    <ExternalLink href="https://kresus.org/faq.html">
                        <span className="fa fa-question-circle" />
                        <span className="label">{$t('client.about.faq')}</span>
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
        let maybeDepLink = <span>{dep}</span>;
        if (dependency.website) {
            maybeDepLink = <ExternalLink href={dependency.website}>{dep}</ExternalLink>;
        }

        thanksItems.push(
            <li key={dep}>
                {maybeDepLink}
                <DisplayIf condition={!!dependency.author}>
                    <span>
                        {' '}
                        {$t('client.about.by')} {dependency.author}
                    </span>
                </DisplayIf>{' '}
                ({$t('client.about.license', { license: dependency.license })})
            </li>
        );
    }

    let license = LICENSE.split('\n\n').map((x, i) => <p key={i}>{x}</p>);

    return (
        <div className="about">
            <h3>{$t('client.about.resources')}</h3>
            <AboutKresus />

            <h3>{$t('client.about.kresus_license')}</h3>
            {license}

            <h3>{$t('client.about.thanks')}</h3>
            <p>{$t('client.about.thanks_description')}</p>
            <ul>{thanksItems}</ul>
        </div>
    );
};

export default About;
