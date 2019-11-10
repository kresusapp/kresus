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
        this.props.fetchLogs();
    };

    handleClear = () => {
        this.props.showClearModal();
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
                        disabled={this.props.isLoadingLogs}>
                        {loadButtonText}
                    </button>
                </div>
                {logs}
            </div>
        );
    }
}

const stateToProps = state => {
    return {
        logs: get.logs(state),
        isLoadingLogs: get.isLoadingLogs(state)
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
