import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { translate as $t, useKresusState } from '../../../helpers';
import { get, actions } from '../../../store';
import { DARK_MODE, DISCOVERY_MODE, FLUID_LAYOUT } from '../../../../shared/settings';

import { Switch, Form } from '../../ui';
import LocaleSelector from './locale-selector';

const CustomizationOptions = () => {
    const isDarkMode = useKresusState(state => get.boolSetting(state, DARK_MODE));
    const isFluidLayout = useKresusState(state => get.boolSetting(state, FLUID_LAYOUT));
    const isDiscoveryModeEnabled = useKresusState(state => get.boolSetting(state, DISCOVERY_MODE));

    const dispatch = useDispatch();
    const handleDarkModeToggle = useCallback(
        (checked: boolean) => {
            return actions.setDarkMode(dispatch, checked);
        },
        [dispatch]
    );

    const toggleFluidLayout = useCallback(
        (checked: boolean) => {
            return actions.setFluidLayout(dispatch, checked);
        },
        [dispatch]
    );
    const handleDiscoveryChange = useCallback(
        (checked: boolean) => {
            return actions.setBoolSetting(dispatch, DISCOVERY_MODE, checked);
        },
        [dispatch]
    );

    return (
        <Form center={true}>
            <Form.Input label={$t('client.settings.customization.locale')} id="locale-selector">
                <LocaleSelector className="form-element-block" />
            </Form.Input>

            <Form.Input
                inline={true}
                label={$t('client.settings.customization.dark_mode')}
                id="dark-mode">
                <Switch
                    onChange={handleDarkModeToggle}
                    checked={isDarkMode}
                    ariaLabel={$t('client.settings.customization.dark_mode')}
                />
            </Form.Input>

            <Form.Input
                inline={true}
                label={$t('client.settings.customization.fluid_layout')}
                help={$t('client.settings.customization.fluid_layout_help')}
                id="fluid-layout">
                <Switch
                    onChange={toggleFluidLayout}
                    checked={isFluidLayout}
                    ariaLabel={$t('client.settings.customization.fluid_layout')}
                />
            </Form.Input>

            <Form.Input
                inline={true}
                label={$t('client.settings.customization.discovery_label')}
                id="discovery-mode">
                <Switch
                    onChange={handleDiscoveryChange}
                    checked={isDiscoveryModeEnabled}
                    ariaLabel={$t('client.settings.customization.discovery_label')}
                />
            </Form.Input>
        </Form>
    );
};

CustomizationOptions.displayName = 'CustomizationOptions';

export default CustomizationOptions;
