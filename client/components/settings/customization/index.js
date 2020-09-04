import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';

import { Switch, FormRow } from '../../ui';
import LocaleSelector from './locale-selector';

const CustomizationOptions = connect(
    state => {
        return {
            isDarkMode: get.boolSetting(state, 'dark-mode'),
            isDiscoveryModeEnabled: get.boolSetting(state, 'discovery-mode'),
        };
    },
    dispatch => {
        return {
            setDarkModeStatus: enabled => {
                actions.setDarkMode(dispatch, enabled);
            },

            setDiscoverySetting(value) {
                actions.setBoolSetting(dispatch, 'discovery-mode', value);
            },
        };
    }
)(props => {
    let handleDarkModeToggle = checked => props.setDarkModeStatus(checked);
    let handleDiscoveryCHange = checked => props.setDiscoverySetting(checked);

    return (
        <div>
            <FormRow
                label={$t('client.settings.customization.locale')}
                inputId="locale-selector"
                input={<LocaleSelector className="form-element-block" />}
            />

            <FormRow
                inline={true}
                label={$t('client.settings.customization.dark_mode')}
                inputId="dark-mode"
                input={
                    <Switch
                        onChange={handleDarkModeToggle}
                        checked={props.isDarkMode}
                        ariaLabel={$t('client.settings.customization.dark_mode')}
                    />
                }
            />

            <FormRow
                inline={true}
                label={$t('client.settings.customization.discovery_label')}
                inputId="discovery-mode"
                input={
                    <Switch
                        onChange={handleDiscoveryCHange}
                        checked={props.isDiscoveryModeEnabled}
                        ariaLabel={$t('client.settings.customization.discovery_label')}
                    />
                }
            />
        </div>
    );
});

export default CustomizationOptions;
