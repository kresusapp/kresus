import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../store';
import { translate as $t } from '../../helpers';
import {
    DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS,
    DUPLICATE_THRESHOLD,
} from '../../../shared/settings';

import { Switch, FormRow, Popform } from '../ui';

const DefaultParameters = connect(
    state => {
        return {
            threshold: get.setting(state, DUPLICATE_THRESHOLD),
            ignoreDifferentCustomFields: get.boolSetting(
                state,
                DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS
            ),
        };
    },

    dispatch => {
        return {
            async setThreshold(value) {
                await actions.setSetting(dispatch, DUPLICATE_THRESHOLD, value);
            },

            async setIgnoreDifferentCustomFields(value) {
                await actions.setBoolSetting(
                    dispatch,
                    DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS,
                    value
                );
            },
        };
    },

    (props, dispatch) => {
        return {
            threshold: props.threshold,
            ignoreDifferentCustomFields: props.ignoreDifferentCustomFields,
            async handleSubmit(threshold, ignoreDifferentCustomFields) {
                try {
                    if (threshold !== props.threshold) {
                        await dispatch.setThreshold(threshold);
                    }
                    if (ignoreDifferentCustomFields !== props.ignoreDifferentCustomFields) {
                        await dispatch.setIgnoreDifferentCustomFields(ignoreDifferentCustomFields);
                    }
                } catch (err) {
                    // TODO Properly report.
                }
            },
        };
    }
)(
    class Content extends React.Component {
        state = {
            threshold: this.props.threshold,
            ignoreDifferentCustomFields: this.props.ignoreDifferentCustomFields,
        };

        handleThresholdChange = event => {
            if (event.target.value) {
                this.setState({
                    threshold: event.target.value,
                });
            }
        };

        handleCustomLabelsCheckChange = checked => {
            this.setState({
                ignoreDifferentCustomFields: checked,
            });
        };

        handleSubmit = () => {
            this.props.handleSubmit(this.state.threshold, this.state.ignoreDifferentCustomFields);
        };

        render() {
            return (
                <Popform
                    trigger={
                        <button className="btn">
                            <span>{$t('client.general.default_parameters')}</span>
                        </button>
                    }
                    confirmClass="success"
                    onConfirm={this.handleSubmit}>
                    <h3>{$t('client.general.default_parameters')}</h3>

                    <FormRow
                        inputId="default_threshold"
                        label={$t('client.similarity.default_threshold')}
                        input={
                            <div className="input-with-addon block">
                                <input
                                    id="duplicateThreshold"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={this.state.threshold}
                                    onChange={this.handleThresholdChange}
                                />
                                <span>{$t('client.units.hours')}</span>
                            </div>
                        }
                        help={$t('client.similarity.default_help')}
                    />

                    <FormRow
                        inline={true}
                        inputId="ignore_different_custom_fields"
                        label={$t('client.similarity.ignore_different_custom_fields')}
                        input={
                            <Switch
                                id="ignoreDifferentCustomFields"
                                checked={this.state.ignoreDifferentCustomFields}
                                onChange={this.handleCustomLabelsCheckChange}
                                ariaLabel={$t('client.similarity.ignore_different_custom_fields')}
                            />
                        }
                        help={$t('client.similarity.ignore_different_custom_fields_desc')}
                    />
                </Popform>
            );
        }
    }
);

export default DefaultParameters;
