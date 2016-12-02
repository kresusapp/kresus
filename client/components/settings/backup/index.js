import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { actions } from '../../../store';

import ImportModule from './import';

const BackupSection = connect(
    null,
    dispatch => {
        return {
            exportInstance(password) {
                actions.exportInstance(dispatch, password);
            }
        };
    })(props => {

        let handleExport = () => {
            props.exportInstance();
        };

        return (
            <div className="top-panel panel panel-default">
                <div className="panel-heading">
                    <h3 className="title panel-title">{ $t('client.settings.tab_backup') }</h3>
                </div>

                <div className="panel-body">
                    <form>
                        <div className="form-group">
                            <div className="row">
                                <label
                                  htmlFor="exportInstance"
                                  className="col-xs-4 control-label">
                                    { $t('client.settings.export_instance') }
                                </label>
                                <div className="col-xs-8">
                                    <button
                                      type="button"
                                      onClick={ handleExport }
                                      id="exportInstance"
                                      className="btn btn-primary">
                                        { $t('client.settings.go_export_instance') }
                                    </button>
                                    <span className="help-block">
                                        { $t('client.settings.export_instance_help') }
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="row">
                                <label
                                  htmlFor="importInstance"
                                  className="col-xs-4 control-label">
                                    { $t('client.settings.import_instance') }
                                </label>
                                <div className="col-xs-8">
                                    <ImportModule />
                                    <span className="help-block">
                                        { $t('client.settings.import_instance_help') }
                                    </span>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        );
    }
);

export default BackupSection;
