import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';

import { MODAL_SLUG } from './report-form-modal';
import ReportItem from './report-item';

const ShowReportCreationModal = connect(
    null,
    dispatch => {
        return {
            handleClick() {
                actions.showModal(dispatch, MODAL_SLUG);
            }
        };
    }
)(props => {
    return (
        <button
            className="fa fa-plus-circle"
            aria-label="create report"
            onClick={props.handleClick}
        />
    );
});

let Reports = props => {
    let items = props.reports.map(pair => (
        <ReportItem key={pair.alert.id} alert={pair.alert} account={pair.account} />
    ));

    return (
        <div className="top-panel panel panel-default">
            <div className="panel-heading">
                <h3 className="title panel-title">{$t('client.settings.emails.reports_title')}</h3>

                <div className="panel-options">
                    <ShowReportCreationModal />
                </div>
            </div>

            <p className="panel-body alert-info">{$t('client.settings.emails.reports_desc')}</p>

            <div className="table-responsive">
                <table className="table">
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
            </div>
        </div>
    );
};

const Export = connect(state => {
    return {
        reports: get.alerts(state, 'report')
    };
})(Reports);

export default Export;
