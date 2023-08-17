import React, { ReactNode } from 'react';

import { copyContentToClipboard, translate as $t } from '../../helpers';
import ExternalLink from '../ui/external-link';
import { repository } from '../../../package.json';

import './error-reporter.css';

interface ErrorReporterProps {
    children?: ReactNode;
}

interface ErrorReporterState {
    error: string | null;
}

class ErrorReporter extends React.Component<ErrorReporterProps, ErrorReporterState> {
    state = {
        error: null,
    };

    refErrorContent = React.createRef<HTMLPreElement>();

    static getDerivedStateFromError(error: Error) {
        let err = error.toString();
        if (error.stack) {
            err += `\nREACT INFO:\n${error.stack}`;
        }

        return {
            error: err,
        };
    }

    handleCopy = () => {
        if (!this.refErrorContent.current) {
            return;
        }

        if (copyContentToClipboard(this.refErrorContent.current)) {
            window.alert(
                $t('client.general.copied_to_clipboard', {
                    name: $t('client.settings.logs.title'),
                })
            );
        }
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
                            {$t('client.general.copy')}
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
