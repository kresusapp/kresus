import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../store';

import { translate as $t } from '../../helpers';

import { registerModal } from '../ui/modal';
import CancelAndSubmit from '../ui/modal/cancel-and-submit-buttons';
import ModalContent from '../ui/modal/content';

export const MODAL_SLUG = 'duplicates-default';

const DefaultParamsModal = connect(
    state => {
        return {
            threshold: get.setting(state, 'duplicate-threshold'),
            ignoreDifferentCustomFields: get.boolSetting(
                state,
                'duplicate-ignore-different-custom-fields'
            )
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
            }
        };
    }
)(
    class Content extends React.Component {
        state = { isSubmitDisabled: true };

        threshold = this.props.threshold;
        ignoreDifferentCustomFields = this.props.ignoreDifferentCustomFields;

        haveParametersChanged() {
            return (
                this.threshold !== this.props.threshold ||
                this.ignoreDifferentCustomFields !== this.props.ignoreDifferentCustomFields
            );
        }

        handleThresholdChange = event => {
            if (event.target.value) {
                this.threshold = event.target.value;
                this.setState({
                    isSubmitDisabled: !this.haveParametersChanged()
                });
            }
        };

        handleCustomLabelsCheckChange = event => {
            this.ignoreDifferentCustomFields = event.target.checked;
            this.setState({
                isSubmitDisabled: !this.haveParametersChanged()
            });
        };

        handleSubmit = () => {
            this.props.handleSubmit(
                this.threshold !== this.props.threshold ? this.threshold : null,
                this.ignoreDifferentCustomFields !== this.props.ignoreDifferentCustomFields
                    ? this.ignoreDifferentCustomFields
                    : null
            );
        };

        render() {
            const body = (
                <form id={MODAL_SLUG} onSubmit={this.handleSubmit}>
                    <div className="cols-with-label">
                        <label htmlFor="duplicateThreshold">
                            {$t('client.similarity.default_threshold')}
                        </label>
                        <div>
                            <div className="input-with-addon block">
                                <input
                                    id="duplicateThreshold"
                                    type="number"
                                    min="0"
                                    step="1"
                                    defaultValue={this.props.threshold}
                                    onChange={this.handleThresholdChange}
                                />
                                <span>{$t('client.units.hours')}</span>
                            </div>
                            <p>{$t('client.similarity.default_help')}</p>
                        </div>
                    </div>
                    <div className="cols-with-label">
                        <label htmlFor="ignoreDifferentCustomFields">
                            {$t('client.similarity.ignore_different_custom_fields')}
                        </label>
                        <div>
                            <input
                                id="ignoreDifferentCustomFields"
                                type="checkbox"
                                defaultChecked={this.props.ignoreDifferentCustomFields}
                                onChange={this.handleCustomLabelsCheckChange}
                            />
                            <p>{$t('client.similarity.ignore_different_custom_fields_desc')}</p>
                        </div>
                    </div>
                </form>
            );

            const footer = (
                <CancelAndSubmit
                    isSubmitDisabled={this.state.isSubmitDisabled}
                    formId={MODAL_SLUG}
                />
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
