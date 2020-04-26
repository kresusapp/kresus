import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';

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
    let handleDarkModeToggle = event => props.setDarkModeStatus(event.target.checked);
    let handleDiscoveryCHange = event => props.setDiscoverySetting(event.target.checked);

    return (
        <form className="settings-form settings-container">
            <p className="wrap-on-mobile">
                <label htmlFor="locale-selector">
                    {$t('client.settings.customization.locale')}
                </label>
                <LocaleSelector className="form-element-block" id="locale-selector" />
            </p>

            <p className="wrap-on-mobile">
                <label htmlFor="theme-selector">
                    {$t('client.settings.customization.dark_mode')}
                </label>
                <input
                    type="checkbox"
                    className="switch"
                    name="dark-mode"
                    onChange={handleDarkModeToggle}
                    checked={props.isDarkMode}
                />
            </p>

            <p>
                <label htmlFor="discovery-mode">
                    {$t('client.settings.customization.discovery_label')}
                </label>
                <input
                    type="checkbox"
                    className="switch"
                    id="discovery-mode"
                    onChange={handleDiscoveryCHange}
                    checked={props.isDiscoveryModeEnabled}
                />
            </p>
        </form>
    );
});

export default CustomizationOptions;
