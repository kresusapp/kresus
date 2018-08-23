import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../store';

import { translate as $t } from '../../helpers';

import { registerModal } from '../ui/modal';
import CancelAndSave from '../ui/modal/cancel-and-save-buttons';
import ModalContent from '../ui/modal/content';

const DefaultParamsModal = connect(
    state => {
        return {
            threshold: get.setting(state, 'duplicateThreshold'),
            ignoreDifferentCustomFields: get.boolSetting(
                state,
                'duplicateIgnoreDifferentCustomFields'
            )
        };
    },
    dispatch => {
        return {
            async handleSubmit(threshold, ignoreDifferentCustomFields) {
                try {
                    if (threshold !== null) {
                        await actions.setSetting(dispatch, 'duplicateThreshold', threshold);
                    }

                    if (ignoreDifferentCustomFields !== null) {
                        await actions.setBoolSetting(
                            dispatch,
                            'duplicateIgnoreDifferentCustomFields',
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
        state = { isSaveDisabled: true };

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
                    isSaveDisabled: !this.haveParametersChanged()
                });
            }
        };

        handleCustomLabelsCheckChange = event => {
            this.ignoreDifferentCustomFields = event.target.checked;
            this.setState({
                isSaveDisabled: !this.haveParametersChanged()
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
                <React.Fragment>
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
                </React.Fragment>
            );

            const footer = (
                <CancelAndSave
                    onSave={this.handleSubmit}
                    isSaveDisabled={this.state.isSaveDisabled}
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

export const MODAL_SLUG = 'duplicates-default';

registerModal(MODAL_SLUG, () => <DefaultParamsModal />);
