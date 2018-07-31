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
            threshold: get.setting(state, 'duplicateThreshold')
        };
    },
    dispatch => {
        return {
            async handleSubmit(threshold) {
                try {
                    await actions.setSetting(dispatch, 'duplicateThreshold', threshold);
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

        handleChange = event => {
            if (event.target.value) {
                this.threshold = event.target.value;
                this.setState({ isSaveDisabled: this.threshold === this.props.threshold });
            }
        };

        handleSubmit = () => {
            this.props.handleSubmit(this.threshold);
        };

        render() {
            const body = (
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
                                onChange={this.handleChange}
                            />
                            <span>{$t('client.units.hours')}</span>
                        </div>
                        <p>{$t('client.similarity.default_help')}</p>
                    </div>
                </div>
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
