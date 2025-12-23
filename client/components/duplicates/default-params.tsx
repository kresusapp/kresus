import React, { useCallback, useState } from 'react';

import { useKresusDispatch, useKresusState } from '../../store';
import * as SettingsStore from '../../store/settings';
import { translate as $t } from '../../helpers';
import { DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS } from '../../../shared/settings';

import { Switch, Form, Popform } from '../ui';
import { useGenericError } from '../../hooks';

const DefaultParameters = () => {
    const initialIgnore = useKresusState(state =>
        SettingsStore.getBool(state.settings, DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS)
    );

    const [ignore, setIgnore] = useState(initialIgnore);

    const handleCustomLabelsCheckChange = useCallback(
        (checked: boolean) => {
            setIgnore(checked);
        },
        [setIgnore]
    );

    const dispatch = useKresusDispatch();
    const handleSubmit = useGenericError(
        useCallback(async () => {
            if (ignore !== initialIgnore) {
                await dispatch(
                    SettingsStore.setBool(DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS, ignore)
                ).unwrap();
            }
        }, [dispatch, initialIgnore, ignore])
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
                    onChange={handleCustomLabelsCheckChange}
                    ariaLabel={$t('client.similarity.ignore_different_custom_fields')}
                />
            </Form.Input>
        </Popform>
    );
};

DefaultParameters.displayName = 'DefaultParameters';

export default DefaultParameters;
