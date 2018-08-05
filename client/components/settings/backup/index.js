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
            exportInstance(password) {
                actions.exportInstance(dispatch, password);
            }
        };
    }
)(props => {
    // We create a new function here because the props.exportInstance function expects a string
    // and if we directly attach props.exportInstance to the button, we will pass an event to it.
    let handleExport = () => {
        props.exportInstance();
    };
    let buttonText = $t(
        `client.settings.${props.isExporting ? 'exporting' : 'go_export_instance'}`
    );

    return (
        <form className="settings-form">
            <div>
                <label htmlFor="exportInstance">{$t('client.settings.export_instance')}</label>

                <div>
                    <button
                        type="button"
                        id="exportInstance"
                        className="kbtn primary"
                        onClick={handleExport}
                        disabled={props.isExporting}>
                        {buttonText}
                    </button>
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
