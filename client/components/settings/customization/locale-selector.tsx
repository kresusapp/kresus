import type * as React from 'react';
import { useCallback } from 'react';
import { LOCALE } from '../../../../shared/settings';
import { translate as $t, notify } from '../../../helpers';
import { useKresusDispatch, useKresusState } from '../../../store';
import * as SettingsStore from '../../../store/settings';

const LocaleSelector = (props: { id?: string; className?: string }) => {
    const currentLocale = useKresusState(state => SettingsStore.get(state.settings, LOCALE));

    const dispatch = useKresusDispatch();
    const onChange = useCallback(
        async (e: React.ChangeEvent<HTMLSelectElement>) => {
            try {
                await dispatch(SettingsStore.set(LOCALE, e.target.value)).unwrap();
                notify.success($t('client.settings.customization.locale_change_success'));
            } catch (_error) {
                notify.error($t('client.settings.customization.update_setting_error'));
            }
        },
        [dispatch]
    );

    const className = `locale-selector ${props.className || ''}`;
    return (
        <select
            id={props.id}
            className={className}
            onChange={onChange}
            defaultValue={currentLocale}
        >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="tr">Türkçe</option>
        </select>
    );
};

LocaleSelector.displayName = 'LocaleSelector';

export default LocaleSelector;
