import React from 'react';
import { connect } from 'react-redux';

import { get } from '../../../store';
import { translate as $t } from '../../../helpers';

import DisplayIf from '../../ui/display-if';

import ImportModule from './import';
import ExportModule from './export';

export default connect(state => {
    return {
        isDemoEnabled: get.isDemoMode(state)
    };
})(props => {
    return (
        <form className="settings-form">
            <div className="wrap-on-mobile">
                <label htmlFor="exportInstance">{$t('client.settings.export_instance')}</label>
                <div>
                    <p className="button-desc">{$t('client.settings.export_instance_help')}</p>
                    <ExportModule />
                </div>
            </div>

            <div className="wrap-on-mobile">
                <label htmlFor="importInstance">{$t('client.settings.import_instance')}</label>
                <DisplayIf condition={props.isDemoEnabled}>
                    <div>
                        <p className="button-desc">{$t('client.settings.import_disabled_help')}</p>
                    </div>
                </DisplayIf>
                <DisplayIf condition={!props.isDemoEnabled}>
                    <div>
                        <p className="button-desc">{$t('client.settings.import_instance_help')}</p>
                        <ImportModule />
                    </div>
                </DisplayIf>
            </div>
        </form>
    );
});
