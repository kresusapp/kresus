import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';

import { Switch } from '../../ui';
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
        <form className="settings-form settings-container">
            <p className="wrap-on-mobile">
                <label htmlFor="locale-selector">
                    {$t('client.settings.customization.locale')}
                </label>
                <LocaleSelector className="form-element-block" id="locale-selector" />
            </p>

            <p className="wrap-on-mobile">
                <label htmlFor="dark-mode">{$t('client.settings.customization.dark_mode')}</label>
                <Switch
                    id="dark-mode"
                    onChange={handleDarkModeToggle}
                    checked={props.isDarkMode}
                    ariaLabel={$t('client.settings.customization.dark_mode')}
                />
            </p>

            <p>
                <label htmlFor="discovery-mode">
                    {$t('client.settings.customization.discovery_label')}
                </label>
                <Switch
                    id="discovery-mode"
                    onChange={handleDiscoveryCHange}
                    checked={props.isDiscoveryModeEnabled}
                    ariaLabel={$t('client.settings.customization.discovery_label')}
                />
            </p>
        </form>
    );
});

export default CustomizationOptions;
