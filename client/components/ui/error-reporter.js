import React from 'react';

import { translate as $t } from '../../helpers';
import ExternalLink from '../ui/external-link';
import { repository } from '../../../package.json';

class ErrorReporter extends React.Component {
    state = {
        error: null
    };

    refErrorContentNode = null;

    refErrorContent = node => {
        this.refErrorContentNode = node;
    };

    componentDidCatch(error, info) {
        let err = `${error.toString()}`;
        if (info !== null && typeof info === 'object' && info.hasOwnProperty('componentStack')) {
            err += `\nREACT INFO:${info.componentStack}`;
        }

        this.setState({
            error: err
        });
    }

    handleCopy = () => {
        if (!this.refErrorContentNode) {
            return;
        }

        let selection = window.getSelection();
        selection.removeAllRanges();

        let range = document.createRange();
        range.selectNodeContents(this.refErrorContentNode);
        selection.addRange(range);

        document.execCommand('copy');

        selection.removeAllRanges();
        window.alert($t('client.settings.logs.copied'));
    };

    render() {
        if (this.state.error !== null) {
            return (
                <div className="error-reporter">
                    <h1>{$t('client.error-reporter.title')}</h1>
                    <p>
                        {$t('client.error-reporter.report')}
                        <ExternalLink href={`${repository.url}/issues/new`}>
                            {$t('client.error-reporter.bugtracker')}
                        </ExternalLink>
                    </p>
                    <p>
                        <button className="btn" onClick={this.handleCopy}>
                            {$t('client.settings.logs.copy')}
                        </button>
                    </p>
                    <pre ref={this.refErrorContent}>{this.state.error}</pre>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorReporter;
