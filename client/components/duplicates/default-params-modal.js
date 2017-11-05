import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../store';

import { translate as $t } from '../../helpers';

import { registerModal } from '../ui/new-modal';
import SaveAndCancel from '../ui/new-modal/save-and-cancel-buttons';
import ModalContent from '../ui/new-modal/content';

const MODAL_SLUG = 'duplicates-default';

const DefaultParamsModal = connect(
    state => {
        return {
            threshold: get.setting(state, 'duplicateThreshold')
        };
    },
    dispatch => {
        return {
            handleClickSave(threshold) {
                actions.setSetting(dispatch, 'duplicateThreshold', threshold).then(err => {
                    if (err === null) {
                        actions.hideModal(dispatch);
                    }
                });
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

        handleClickSave = () => {
            this.props.handleClickSave(this.threshold);
        };

        render() {
            const body = (
                <div className="form-group clearfix">
                    <label htmlFor="duplicateThreshold" className="col-xs-4 control-label">
                        {$t('client.similarity.default_threshold')}
                    </label>
                    <div className="col-xs-8">
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
                        <span className="help-block">{$t('client.similarity.default_help')}</span>
                    </div>
                </div>
            );

            const footer = (
                <SaveAndCancel
                    onClickSave={this.handleClickSave}
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

// Register the modal to the factory.
registerModal(MODAL_SLUG, () => <DefaultParamsModal />);

// The button to open the modal
export const ShowButton = connect(
    null,
    dispatch => {
        return {
            handleOpenModal() {
                actions.showModal(dispatch, MODAL_SLUG);
            }
        };
    }
)(props => {
    return (
        <button className="btn btn-default default-params" onClick={props.handleOpenModal}>
            <span className="fa fa-cog" />
            <span>{$t('client.general.default_parameters')}</span>
        </button>
    );
});
