import React, { useCallback } from 'react';

import { translate as $t } from '../../../helpers';
import { useKresusDispatch, useKresusState } from '../../../store';
import * as SettingsStore from '../../../store/settings';
import { getDefaultAccountId, setDefaultAccountId } from '../../../store/banks';
import {
    DARK_MODE,
    DISCOVERY_MODE,
    FLUID_LAYOUT,
    LIMIT_ONGOING_TO_CURRENT_MONTH,
} from '../../../../shared/settings';

import { Switch, Form } from '../../ui';
import AnyAccountSelector from '../../ui/account-select';

import LocaleSelector from './locale-selector';

const CustomizationOptions = () => {
    const isDarkMode = useKresusState(state => SettingsStore.getBool(state.settings, DARK_MODE));
    const isFluidLayout = useKresusState(state =>
        SettingsStore.getBool(state.settings, FLUID_LAYOUT)
    );
    const isDiscoveryModeEnabled = useKresusState(state =>
        SettingsStore.getBool(state.settings, DISCOVERY_MODE)
    );
    const isOngoingLimitedToCurrentMonth = useKresusState(state =>
        SettingsStore.getBool(state.settings, LIMIT_ONGOING_TO_CURRENT_MONTH)
    );
    const defaultAccountId = useKresusState(state => getDefaultAccountId(state.banks));

    const dispatch = useKresusDispatch();

    const toggleDarkMode = useCallback(
        async (checked: boolean) => {
            await dispatch(SettingsStore.setBool(DARK_MODE, checked)).unwrap();
        },
        [dispatch]
    );
    const toggleFluidLayout = useCallback(
        async (checked: boolean) => {
            await dispatch(SettingsStore.setBool(FLUID_LAYOUT, checked)).unwrap();
        },
        [dispatch]
    );
    const toggleDiscoveryMode = useCallback(
        async (checked: boolean) => {
            await dispatch(SettingsStore.setBool(DISCOVERY_MODE, checked)).unwrap();
        },
        [dispatch]
    );
    const setIsOngoingLimitedToCurrentMonth = useCallback(
        async (checked: boolean) => {
            await dispatch(SettingsStore.setBool(LIMIT_ONGOING_TO_CURRENT_MONTH, checked)).unwrap();
        },
        [dispatch]
    );

    const setDefaultAccount = useCallback(
        async (id: number) => {
            const finalId = id === -1 ? null : id;
            return await dispatch(setDefaultAccountId(finalId)).unwrap();
        },
        [dispatch]
    );
    const defaultAccountKey = defaultAccountId === null ? -1 : defaultAccountId;

    return (
        <Form center={true}>
            <Form.Input
                label={$t('client.accesses.default_account')}
                id="default-account-selector"
                help={$t('client.accesses.default_account_helper')}>
                <AnyAccountSelector
                    includeNone={true}
                    onChange={setDefaultAccount}
                    initial={defaultAccountKey}
                />
            </Form.Input>

            <Form.Input label={$t('client.settings.customization.locale')} id="locale-selector">
                <LocaleSelector className="form-element-block" />
            </Form.Input>

            <Form.Input
                inline={true}
                label={$t('client.settings.customization.dark_mode')}
                id="dark-mode">
                <Switch
                    onChange={toggleDarkMode}
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
                    onChange={toggleDiscoveryMode}
                    checked={isDiscoveryModeEnabled}
                    ariaLabel={$t('client.settings.customization.discovery_label')}
                />
            </Form.Input>

            <Form.Input
                inline={true}
                label={$t('client.settings.customization.limit_ongoing_to_current_month')}
                id="discovery-mode">
                <Switch
                    onChange={setIsOngoingLimitedToCurrentMonth}
                    checked={isOngoingLimitedToCurrentMonth}
                    ariaLabel={$t('client.settings.customization.limit_ongoing_to_current_month')}
                />
            </Form.Input>
        </Form>
    );
};

CustomizationOptions.displayName = 'CustomizationOptions';

export default CustomizationOptions;
