import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { actions, get } from '../../../store';

const Export = connect(
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
        </div>
    );
});

export default Export;
