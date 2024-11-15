import React from 'react';

import { translate as $t } from '../../../helpers';
import { useKresusState } from '../../../store';
import * as BanksStore from '../../../store/banks';
import { ButtonLink } from '../../ui';

import ReportItem from './report-item';
import URL from './urls';

const Reports = () => {
    const reports = useKresusState(state => BanksStore.alertPairsByType(state.banks, 'report'));

    const items = reports.map(pair => (
        <ReportItem key={pair.alert.id} alert={pair.alert} account={pair.account} />
    ));

    return (
        <table className="alerts-and-reports no-vertical-border">
            <caption>
                <div>
                    <h3>{$t('client.settings.emails.reports_title')}</h3>
                    <div className="actions">
                        <ButtonLink
                            to={URL.newReport.url()}
                            aria={'create report'}
                            icon="plus-circle"
                            className="transparent"
                        />
                    </div>
                </div>
            </caption>
            <tfoot className="alerts info">
                <tr>
                    <td colSpan={4}>{$t('client.settings.emails.reports_desc')}</td>
                </tr>
            </tfoot>
            <thead>
                <tr>
                    <th>{$t('client.settings.emails.account')}</th>
                    <th>{$t('client.settings.emails.details')}</th>
                    <th />
                    <th />
                </tr>
            </thead>
            <tbody>{items}</tbody>
        </table>
    );
};

Reports.displayName = 'Reports';

export default Reports;
