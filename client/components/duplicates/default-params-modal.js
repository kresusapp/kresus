import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../store';

import { translate as $t } from '../../helpers';

import { registerModal } from '../ui/modal';
import CancelAndSubmit from '../ui/modal/cancel-and-submit-buttons';
import ModalContent from '../ui/modal/content';

import { Switch, FormRow } from '../ui';

export const MODAL_SLUG = 'duplicates-default';

const DefaultParamsModal = connect(
    state => {
        return {
            threshold: get.setting(state, 'duplicate-threshold'),
            ignoreDifferentCustomFields: get.boolSetting(
                state,
                'duplicate-ignore-different-custom-fields'
            ),
        };
    },

    dispatch => {
        return {
            async handleSubmit(threshold, ignoreDifferentCustomFields) {
                try {
                    if (threshold !== null) {
                        await actions.setSetting(dispatch, 'duplicate-threshold', threshold);
                    }

                    if (ignoreDifferentCustomFields !== null) {
                        await actions.setBoolSetting(
                            dispatch,
                            'duplicate-ignore-different-custom-fields',
                            ignoreDifferentCustomFields
                        );
                    }

                    actions.hideModal(dispatch);
                } catch (err) {
                    // TODO Properly report.
                }
            },
        };
    }
)(
    class Content extends React.Component {
        state = {
            hasChanged: false,
            threshold: this.props.threshold,
            ignoreDifferentCustomFields: this.props.ignoreDifferentCustomFields,
        };

        haveParametersChanged() {
            return (
                this.state.threshold !== this.props.threshold ||
                this.state.ignoreDifferentCustomFields !== this.props.ignoreDifferentCustomFields
            );
        }

        handleThresholdChange = event => {
            if (event.target.value) {
                this.setState({
                    threshold: event.target.value,
                    hasChanged: true,
                });
            }
        };

        handleCustomLabelsCheckChange = checked => {
            this.setState({
                hasChanged: true,
                ignoreDifferentCustomFields: checked,
            });
        };

        handleSubmit = e => {
            e.preventDefault();
            this.props.handleSubmit(
                this.state.threshold !== this.props.threshold ? this.state.threshold : null,
                this.state.ignoreDifferentCustomFields !== this.props.ignoreDifferentCustomFields
                    ? this.state.ignoreDifferentCustomFields
                    : null
            );
        };

        render() {
            const body = (
                <form id={MODAL_SLUG} onSubmit={this.handleSubmit}>
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
                </form>
            );

            const footer = (
                <CancelAndSubmit isSubmitDisabled={!this.state.hasChanged} formId={MODAL_SLUG} />
            );

            return (
                <ModalContent
                    title={$t('client.general.default_parameters')}
                    body={body}
                    footer={footer}
                />
            );
        }
    }
);

registerModal(MODAL_SLUG, () => <DefaultParamsModal />);
