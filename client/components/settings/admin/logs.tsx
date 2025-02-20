import React, { useCallback, useRef, useState } from 'react';

import { translate as $t, notify, copyContentToClipboard } from '../../../helpers';
import * as backend from '../../../store/backend';

import { Form, Popconfirm } from '../../ui';
import DiscoveryMessage from '../../ui/discovery-message';
import { useNotifyError } from '../../../hooks';

const Logs = () => {
    const [logs, setLogs] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const refLogs = useRef<HTMLPreElement>(null);

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const serverLogs = await backend.fetchLogs();
            setLogs(serverLogs);
        } catch (err) {
            notify.error($t('client.settings.logs.fetch_logs_error', { error: err.toString() }));
        } finally {
            setIsLoading(false);
        }
    }, [setIsLoading, setLogs]);

    const clearLogs = useNotifyError(
        'client.settings.logs.clear_logs_error',
        useCallback(async () => {
            await backend.clearLogs();
            setLogs(null);
            notify.success($t('client.settings.logs.clear_logs_success'));
        }, [])
    );

    const handleCopy = useCallback(() => {
        if (!refLogs.current) {
            return;
        }

        if (copyContentToClipboard(refLogs.current)) {
            notify.success(
                $t('client.general.copied_to_clipboard', {
                    name: $t('client.settings.logs.title'),
                })
            );
        }
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
            <Form.Toolbar align="right">
                <button className="btn" onClick={handleCopy} disabled={logs === null}>
                    {$t('client.general.copy')}
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
            </Form.Toolbar>
            {displayedLogs}
        </div>
    );
};

Logs.displayName = 'Logs';

export default Logs;
