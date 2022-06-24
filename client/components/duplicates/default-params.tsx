import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { actions, get } from '../../store';
import { translate as $t, useKresusState } from '../../helpers';
import {
    DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS,
    DUPLICATE_THRESHOLD,
} from '../../../shared/settings';

import { Switch, Form, Popform } from '../ui';
import { useGenericError } from '../../hooks';

const DefaultParameters = () => {
    const initialThreshold = useKresusState(state => get.setting(state, DUPLICATE_THRESHOLD));
    const initialIgnore = useKresusState(state =>
        get.boolSetting(state, DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS)
    );

    const [threshold, setThreshold] = useState(initialThreshold);
    const [ignore, setIgnore] = useState(initialIgnore);

    const handleThresholdChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            if (event.target.value) {
                setThreshold(event.target.value);
            }
        },
        [setThreshold]
    );

    const handleCustomLabelsCheckChange = useCallback(
        (checked: boolean) => {
            setIgnore(checked);
        },
        [setIgnore]
    );

    const dispatch = useDispatch();
    const handleSubmit = useGenericError(
        useCallback(async () => {
            if (threshold !== initialThreshold) {
                await actions.setSetting(dispatch, DUPLICATE_THRESHOLD, threshold);
            }
            if (ignore !== initialIgnore) {
                await actions.setBoolSetting(
                    dispatch,
                    DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS,
                    ignore
                );
            }
        }, [dispatch, threshold, initialThreshold, initialIgnore, ignore])
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
                id="default_threshold"
                label={$t('client.similarity.default_threshold')}
                help={$t('client.similarity.default_help')}>
                <div className="input-with-addon block">
                    <input
                        id="duplicateThreshold"
                        type="number"
                        min="0"
                        step="1"
                        value={threshold}
                        onChange={handleThresholdChange}
                    />
                    <span>{$t('client.units.hours')}</span>
                </div>
            </Form.Input>

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
