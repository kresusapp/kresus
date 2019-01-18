import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { actions, get } from '../../../store';

import ImportModule from './import';

const BackupSection = connect(
    state => {
        return {
            isExporting: get.isExporting(state)
        };
    },
    dispatch => {
        return {
            /*
            handleExportWithPassword(password) {
                actions.exportInstance(dispatch, password);
            },
            */
            handleExportWithoutPassword() {
                actions.exportInstance(dispatch);
            }
        };
    }
)(props => {
    let buttonText;
    let maybeSpinner;
    if (props.isExporting) {
        buttonText = $t('client.settings.exporting');
        maybeSpinner = <span className="fa fa-spinner" />;
    } else {
        buttonText = $t('client.settings.go_export_instance');
        maybeSpinner = null;
    }

    return (
        <form className="settings-form">
            <div>
                <label htmlFor="exportInstance">{$t('client.settings.export_instance')}</label>

                <div>
                    <button
                        type="button"
                        id="exportInstance"
                        className="btn primary"
                        onClick={props.handleExportWithoutPassword}
                        disabled={props.isExporting}>
                        {buttonText}
                    </button>
                    {maybeSpinner}
                    <p className="button-desc">{$t('client.settings.export_instance_help')}</p>
                </div>
            </div>

            <div>
                <label htmlFor="importInstance">{$t('client.settings.import_instance')}</label>

                <div>
                    <ImportModule />
                    <p className="button-desc">{$t('client.settings.import_instance_help')}</p>
                </div>
            </div>
        </form>
    );
});

export default BackupSection;
