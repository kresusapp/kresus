import React from 'react';

import { translate as $t } from '../../helpers';

import ExternalLink from '../ui/external-link';

import rawDependencies from './dependencies.json';
import { repository } from '../../../package.json';

// eslint-disable-next-line
import { plainText as LICENSE } from '../../../LICENSE';

import DisplayIf from '../ui/display-if';

import './about.css';

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
                    <ExternalLink href="https://matrix.to/#/#kresus:delire.party ">
                        <span className="fa fa-comments" />
                        <span className="label">{$t('client.about.chat')}</span>
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
    const thanksItems = [];

    const dependencies = rawDependencies as Record<
        string,
        {
            author: string;
            license: string;
            website?: string;
        }
    >;

    for (const dependencyName of Object.keys(dependencies).sort()) {
        const descriptor = dependencies[dependencyName];

        let maybeDepLink;
        if (descriptor.website) {
            maybeDepLink = <ExternalLink href={descriptor.website}>{dependencyName}</ExternalLink>;
        } else {
            maybeDepLink = <span>{dependencyName}</span>;
        }

        thanksItems.push(
            <li key={dependencyName}>
                {maybeDepLink}
                <DisplayIf condition={!!descriptor.author}>
                    <span>
                        {' '}
                        {$t('client.about.by')} {descriptor.author}
                    </span>
                </DisplayIf>{' '}
                ({$t('client.about.license', { license: descriptor.license })})
            </li>
        );
    }

    const license = (LICENSE as string).split('\n\n').map((x, i) => <p key={i}>{x}</p>);

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

About.displayName = 'About';

export default About;
