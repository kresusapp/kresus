import React from 'react';

import { translate as $t } from '../../helpers';

import ExternalLink from '../ui/external-link';

import dependencies from './dependenciesLicenses.json';
import { repository } from '../../../package.json';

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
        let maybeAuthor = null;
        if (dependency.author) {
            maybeAuthor = (
                <span>
                    {$t('client.about.by')} {dependency.author}
                </span>
            );
        }
        thanksItems.push(
            <li key={dep}>
                {maybeDepLink} {maybeAuthor} (
                {$t('client.about.license', { license: dependency.license })})
            </li>
        );
    }

    return (
        <div className="about">
            <h3>{$t('client.about.resources')}</h3>
            <AboutKresus />

            <h3>{$t('client.about.kresus_license')}</h3>
            <p>The MIT License (MIT)</p>
            <p>Copyright (c) 2014-2018 Benjamin Bouvier</p>
            <p>
                Permission is hereby granted, free of charge, to any person obtaining a copy of this
                software and associated documentation files (the &quot;Software&quot;), to deal in
                the Software without restriction, including without limitation the rights to use,
                copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
                Software, and to permit persons to whom the Software is furnished to do so, subject
                to the following conditions:
            </p>

            <p>
                The above copyright notice and this permission notice shall be included in all
                copies or substantial portions of the Software.
            </p>

            <p>
                THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR
                A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
                HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
                CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
                OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
            </p>

            <h3>{$t('client.about.thanks')}</h3>
            <p>{$t('client.about.thanks_description')}</p>
            <ul>{thanksItems}</ul>
        </div>
    );
};

export default About;
