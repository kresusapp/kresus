import React from 'react';
import { connect } from 'react-redux';

import { translate as $t, notify } from '../../../helpers';
import { get, actions } from '../../../store';

import { Popconfirm } from '../../ui';
import DiscoveryMessage from '../../ui/discovery-message';

export default connect(
    state => {
        return {
            logs: get.logs(state),
            isLoadingLogs: get.isLoadingLogs(state),
        };
    },
    dispatch => {
        return {
            fetchLogs() {
                actions.fetchLogs(dispatch);
            },
            clearLogs() {
                actions.clearLogs(dispatch);
            },
            resetLogs() {
                actions.resetLogs(dispatch);
            },
        };
    }
)(
    class LogsSection extends React.PureComponent {
        handleRefresh = () => {
            this.props.fetchLogs();
        };

        handleCopy = () => {
            if (!this.refLogsContent.current) {
                return;
            }

            let selection = window.getSelection();
            selection.removeAllRanges();

            let range = document.createRange();
            range.selectNodeContents(this.refLogsContent.current);
            selection.addRange(range);

            document.execCommand('copy');

            selection.removeAllRanges();
            notify.success($t('client.settings.logs.copied'));
        };

        componentWillUnmount() {
            // We want to assure the spinner will be displayed on the next fetch.
            this.props.resetLogs();
        }

        refLogsContent = React.createRef();

        render() {
            let logs;
            if (this.props.isLoadingLogs) {
                logs = (
                    <p>
                        <i className="fa fa-spinner" />
                    </p>
                );
            } else {
                logs = <pre ref={this.refLogsContent}>{this.props.logs}</pre>;
            }

            let loadButtonText =
                this.props.logs === null
                    ? $t('client.settings.logs.load')
                    : $t('client.settings.logs.refresh');

            return (
                <div className="settings-container settings-logs">
                    <DiscoveryMessage message={$t('client.settings.logs.share_notice')} />
                    <div className="buttons-toolbar">
                        <button
                            className="btn"
                            onClick={this.handleCopy}
                            disabled={!this.props.logs}>
                            {$t('client.settings.logs.copy')}
                        </button>

                        <Popconfirm
                            trigger={
                                <button className="btn danger">
                                    {$t('client.settings.logs.clear')}
                                </button>
                            }
                            onConfirm={this.props.clearLogs}>
                            <h3>{$t('client.settings.logs.clear')}</h3>
                            <p>{$t('client.settings.logs.confirm_clear')}</p>
                        </Popconfirm>

                        <button
                            className="btn primary"
                            onClick={this.handleRefresh}
                            disabled={this.props.isLoadingLogs}>
                            {loadButtonText}
                        </button>
                    </div>
                    {logs}
                </div>
            );
        }
    }
);
