import React, { useCallback, useRef, useState } from 'react';

import { translate as $t, notify, assertNotNull } from '../../../helpers';
import { actions } from '../../../store';

import { Popconfirm } from '../../ui';
import DiscoveryMessage from '../../ui/discovery-message';
import { useNotifyError } from '../../../hooks';

const Logs = () => {
    const [logs, setLogs] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const refLogs = useRef<HTMLPreElement>(null);

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const serverLogs = await actions.fetchLogs();
            setLogs(serverLogs);
        } catch (err) {
            notify.error(`${$t('client.settings.logs.fetch_logs_error')}: ${err.toString()}`);
        } finally {
            setIsLoading(false);
        }
    }, [setIsLoading, setLogs]);

    const clearLogs = useNotifyError(
        'client.settings.logs.clear_logs_error',
        useCallback(async () => {
            await actions.clearLogs();
            setLogs(null);
            notify.success($t('client.settings.logs.clear_logs_success'));
        }, [])
    );

    const handleCopy = useCallback(() => {
        if (!refLogs.current) {
            return;
        }

        const selection = window.getSelection();
        assertNotNull(selection);
        selection.removeAllRanges();

        const range = document.createRange();
        range.selectNodeContents(refLogs.current);
        selection.addRange(range);

        document.execCommand('copy');

        selection.removeAllRanges();
        notify.success($t('client.settings.logs.copied'));
    }, []);

    let displayedLogs;
    if (isLoading) {
        displayedLogs = (
            <p>
                <i className="fa fa-spinner" />
            </p>
        );
    } else {
        displayedLogs = <pre ref={refLogs}>{logs}</pre>;
    }

    const loadButtonText =
        logs === null ? $t('client.settings.logs.load') : $t('client.settings.logs.refresh');

    return (
        <div className="settings-container settings-logs">
            <DiscoveryMessage message={$t('client.settings.logs.share_notice')} />
            <div className="buttons-toolbar">
                <button className="btn" onClick={handleCopy} disabled={logs === null}>
                    {$t('client.settings.logs.copy')}
                </button>

                <Popconfirm
                    trigger={
                        <button className="btn danger">{$t('client.settings.logs.clear')}</button>
                    }
                    onConfirm={clearLogs}>
                    <p>{$t('client.settings.logs.confirm_clear')}</p>
                </Popconfirm>

                <button className="btn primary" onClick={fetchLogs} disabled={isLoading}>
                    {loadButtonText}
                </button>
            </div>
            {displayedLogs}
        </div>
    );
};

Logs.displayName = 'Logs';

export default Logs;
