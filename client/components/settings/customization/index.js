import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';
import { DARK_MODE, DISCOVERY_MODE, FLUID_LAYOUT } from '../../../../shared/settings';

import { Switch, FormRow } from '../../ui';
import LocaleSelector from './locale-selector';

const CustomizationOptions = connect(
    state => {
        return {
            isDarkMode: get.boolSetting(state, DARK_MODE),
            isFluidLayout: get.boolSetting(state, FLUID_LAYOUT),
            isDiscoveryModeEnabled: get.boolSetting(state, DISCOVERY_MODE),
        };
    },
    dispatch => {
        return {
            setDarkModeStatus(value) {
                actions.setDarkMode(dispatch, value);
            },
            setFluidLayout(value) {
                actions.setFluidLayout(dispatch, value);
            },
            setDiscoverySetting(value) {
                actions.setBoolSetting(dispatch, DISCOVERY_MODE, value);
            },
        };
    }
)(props => {
    let handleDarkModeToggle = checked => props.setDarkModeStatus(checked);
    let toggleFluidLayout = checked => props.setFluidLayout(checked);
    let handleDiscoveryChange = checked => props.setDiscoverySetting(checked);

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
                label={$t('client.settings.customization.fluid_layout')}
                help={$t('client.settings.customization.fluid_layout_help')}
                inputId="fluid-layout"
                input={
                    <Switch
                        onChange={toggleFluidLayout}
                        checked={props.isFluidLayout}
                        ariaLabel={$t('client.settings.customization.fluid_layout')}
                    />
                }
            />

            <FormRow
                inline={true}
                label={$t('client.settings.customization.discovery_label')}
                inputId="discovery-mode"
                input={
                    <Switch
                        onChange={handleDiscoveryChange}
                        checked={props.isDiscoveryModeEnabled}
                        ariaLabel={$t('client.settings.customization.discovery_label')}
                    />
                }
            />
        </div>
    );
});

export default CustomizationOptions;
