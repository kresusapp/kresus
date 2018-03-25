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
        <form className="top-panel">
            <div className="form-group">
                <div className="row">
                    <label htmlFor="exportInstance" className="col-xs-4 control-label">
                        {$t('client.settings.export_instance')}
                    </label>
                    <div className="col-xs-8">
                        <button
                            type="button"
                            id="exportInstance"
                            className="btn btn-primary"
                            onClick={handleExport}
                            disabled={props.isExporting}>
                            {buttonText}
                        </button>
                        <span className="help-block">
                            {$t('client.settings.export_instance_help')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="form-group">
                <div className="row">
                    <label htmlFor="importInstance" className="col-xs-4 control-label">
                        {$t('client.settings.import_instance')}
                    </label>
                    <div className="col-xs-8">
                        <ImportModule />
                        <span className="help-block">
                            {$t('client.settings.import_instance_help')}
                        </span>
                    </div>
                </div>
            </div>
        </form>
    );
});

export default BackupSection;
