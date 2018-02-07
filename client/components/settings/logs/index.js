import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';

class LogsSection extends React.PureComponent {
    constructor(props) {
        super(props);

        this.handleRefresh = this.handleRefresh.bind(this);
        this.handleCopy = this.handleCopy.bind(this);
        this.logsContentNode = null;
    }

    handleRefresh() {
        this.props.fetchLogs();
    }

    handleCopy() {
        if (this.logsContentNode) {
            let selection = window.getSelection();
            selection.removeAllRanges();

            let range = document.createRange();
            range.selectNodeContents(this.logsContentNode);
            selection.addRange(range);

            document.execCommand('copy');

            selection.removeAllRanges();
            window.alert($t('client.settings.logs.copied'));
        }
    }

    componentDidMount() {
        this.props.fetchLogs();
    }

    componentWillUnmount() {
        // We want to assure the spinner will be displayed every time before a
        // fetch.
        this.props.resetLogs();
    }

    render() {
        let logs;
        if (this.props.logs !== null) {
            let refLogsContent = node => {
                this.logsContentNode = node;
            };
            logs = <pre ref={refLogsContent}>{this.props.logs}</pre>;
        } else {
            logs = (
                <p>
                    <i className="fa fa-spinner" />
                </p>
            );
        }

        return (
            <div className="top-panel">
                <p>
                    <button className="btn btn-default" onClick={this.handleCopy}>
                        {$t('client.settings.logs.copy')}
                    </button>
                    <button className="btn btn-primary pull-right" onClick={this.handleRefresh}>
                        {$t('client.settings.logs.refresh')}
                    </button>
                </p>
                {logs}
            </div>
        );
    }
}

const stateToProps = state => {
    return {
        logs: get.logs(state)
    };
};

const dispatchToProps = dispatch => {
    return {
        fetchLogs() {
            actions.fetchLogs(dispatch);
        },
        resetLogs() {
            actions.resetLogs(dispatch);
        }
    };
};

const Export = connect(stateToProps, dispatchToProps)(LogsSection);

export default Export;
