import React from 'react';
import { connect } from 'react-redux';

import { translate as $t, notify } from '../../../helpers';
import { get, actions } from '../../../store';

import { registerModal } from '../../ui/modal';
import CancelAndDelete from '../../ui/modal/cancel-and-delete-buttons';
import ModalContent from '../../ui/modal/content';

export const MODAL_SLUG = 'confirm-logs-clear';

const ConfirmClearModal = connect(
    null,
    dispatch => {
        return {
            handleDelete: () => {
                actions.clearLogs(dispatch);
                actions.hideModal(dispatch);
            }
        };
    }
)(props => {
    let footer = <CancelAndDelete onDelete={props.handleDelete} />;
    return (
        <ModalContent
            title={$t('client.settings.logs.clear')}
            body={$t('client.settings.logs.confirm_clear')}
            footer={footer}
        />
    );
});

registerModal(MODAL_SLUG, () => <ConfirmClearModal />);

class LogsSection extends React.PureComponent {
    handleRefresh = () => {
        this.props.resetLogs();
        this.props.fetchLogs();
    };

    handleClear = () => {
        this.props.showClearModal();
    };

    handleCopy = () => {
        if (!this.logsContentNode) {
            return;
        }

        let selection = window.getSelection();
        selection.removeAllRanges();

        let range = document.createRange();
        range.selectNodeContents(this.logsContentNode);
        selection.addRange(range);

        document.execCommand('copy');

        selection.removeAllRanges();
        notify.success($t('client.settings.logs.copied'));
    };

    componentDidMount() {
        this.props.fetchLogs();
    }

    componentWillUnmount() {
        // We want to assure the spinner will be displayed on the next fetch.
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

        // Note: logs === null means we haven't fetch logs yet; !logs means
        // either that or the logs content are empty.
        return (
            <div className="settings-container settings-logs">
                <div className="buttons-toolbar">
                    <button className="btn" onClick={this.handleCopy} disabled={!this.props.logs}>
                        {$t('client.settings.logs.copy')}
                    </button>
                    <button
                        className="btn danger"
                        onClick={this.handleClear}
                        disabled={!this.props.logs}>
                        {$t('client.settings.logs.clear')}
                    </button>
                    <button
                        className="btn primary"
                        onClick={this.handleRefresh}
                        disabled={this.props.logs === null}>
                        {$t('client.settings.logs.refresh')}
                    </button>
                </div>
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
        showClearModal() {
            actions.showModal(dispatch, MODAL_SLUG);
        },
        resetLogs() {
            actions.resetLogs(dispatch);
        }
    };
};

const Export = connect(
    stateToProps,
    dispatchToProps
)(LogsSection);

export default Export;
