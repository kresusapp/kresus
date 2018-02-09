import React from 'react';

import { translate as $t } from '../../helpers';

import ExternalLink from '../ui/external-link';

import dependencies from './dependenciesLicenses.json';

const AboutKresus = () => {
    return (
        <div className="support-about">
            <p className="desc">{$t('client.about.description')}</p>

            <ul className="grid">
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
            <li key={dep}>
                {maybeDepLink} ({$t('client.about.license', { license: dependency.license })})
            </li>
        );
    }
    const thanksText = thanksItems.reduce((accu, elem) => {
        return accu === null ? [elem] : [...accu, ', ', elem]
    }, null);

    return (
        <div className="about">
            <h3>{$t('client.about.resources')}</h3>
            <AboutKresus />

            <h3>{$t('client.about.kresus_license')}</h3>
            <p>The MIT License (MIT)</p>
            <p>Copyright (c) 2014-2018 Benjamin Bouvier</p>
            <p>
                Permission is hereby granted, free of charge, to any person obtaining a copy
                of this software and associated documentation files (the "Software"), to deal
                in the Software without restriction, including without limitation the rights
                to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                copies of the Software, and to permit persons to whom the Software is
                furnished to do so, subject to the following conditions:
            </p>

            <p>
                The above copyright notice and this permission notice shall be included in all
                copies or substantial portions of the Software.
            </p>

            <p>
                THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
                SOFTWARE.
            </p>

            <h3>{$t('client.about.thanks')}</h3>
            <p>{$t('client.about.thanks_description')}</p>
            <ul>{thanksItems}</ul>
        </div>
    );
};

export default About;
