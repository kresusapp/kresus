import React, { useCallback, useState } from 'react';

import { useKresusDispatch, useKresusState } from '../../store';
import * as SettingsStore from '../../store/settings';
import { translate as $t } from '../../helpers';
import {
    DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS,
    DUPLICATE_LAX_MODE,
} from '../../../shared/settings';

import { Switch, Form, Popform } from '../ui';
import { useGenericError } from '../../hooks';

const DefaultParameters = () => {
    const initialIgnore = useKresusState(state =>
        SettingsStore.getBool(state.settings, DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS)
    );

    const [ignore, setIgnore] = useState(initialIgnore);

    const initialLaxMode = useKresusState(state =>
        SettingsStore.getBool(state.settings, DUPLICATE_LAX_MODE)
    );

    const [laxMode, setLaxMode] = useState(initialLaxMode);

    const dispatch = useKresusDispatch();
    const handleSubmit = useGenericError(
        useCallback(async () => {
            if (ignore !== initialIgnore) {
                await dispatch(
                    SettingsStore.setBool(DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS, ignore)
                ).unwrap();
            }
            if (laxMode !== initialLaxMode) {
                await dispatch(SettingsStore.setBool(DUPLICATE_LAX_MODE, laxMode)).unwrap();
            }
        }, [dispatch, initialIgnore, ignore, initialLaxMode, laxMode])
    );

    return (
        <Popform
            small={false}
            trigger={
                <button className="btn">
                    <span>{$t('client.general.default_parameters')}</span>
                </button>
            }
            confirmClass="success"
            onConfirm={handleSubmit}>
            <h3>{$t('client.general.default_parameters')}</h3>

            <Form.Input
                inline={true}
                id="ignore_different_custom_fields"
                label={$t('client.similarity.ignore_different_custom_fields')}
                help={$t('client.similarity.ignore_different_custom_fields_desc')}>
                <Switch
                    id="ignoreDifferentCustomFields"
                    checked={ignore}
                    onChange={setIgnore}
                    ariaLabel={$t('client.similarity.ignore_different_custom_fields')}
                />
            </Form.Input>

            <Form.Input
                inline={true}
                id="lax_level"
                label={$t('client.similarity.lax_level')}
                help={$t('client.similarity.lax_level_desc')}>
                <Switch
                    id="laxMatching"
                    checked={laxMode}
                    onChange={setLaxMode}
                    ariaLabel={$t('client.similarity.lax_level')}
                />
            </Form.Input>
        </Popform>
    );
};

DefaultParameters.displayName = 'DefaultParameters';

export default DefaultParameters;
