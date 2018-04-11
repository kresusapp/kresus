import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { actions, get } from '../../store';

import { translate as $t } from '../../helpers';

import Modal from '../ui/modal';

class DefaultParamsModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.threshold
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
    }

    handleOpen() {
        this.setState({
            value: this.props.threshold
        });
    }

    handleChange(event) {
        this.setState({
            value: event.currentTarget.value
        });
    }

    handleSave() {
        if (this.state.value !== this.props.threshold) {
            this.props.setThreshold(this.state.value);
            $(`#${this.props.modalId}`).modal('toggle');
        }
    }

    render() {
        let modalId = this.props.modalId;
        let modalBody = (
            <div className="form-group clearfix">
                <label htmlFor="duplicateThreshold" className="col-xs-4 control-label">
                    {$t('client.similarity.default_threshold')}
                </label>
                <div className="col-xs-8">
                    <div className="input-with-addon block">
                        <input
                            id="duplicateThreshold"
                            type="number"
                            className="form-control"
                            min="0"
                            step="1"
                            value={this.state.value}
                            onChange={this.handleChange}
                        />
                        <span>{$t('client.units.hours')}</span>
                    </div>
                    <span className="help-block">{$t('client.similarity.default_help')}</span>
                </div>
            </div>
        );

        let modalFooter = (
            <div>
                <input
                    type="button"
                    className="btn btn-default"
                    data-dismiss="modal"
                    value={$t('client.general.cancel')}
                />
                <input
                    type="submit"
                    className="btn btn-success"
                    value={$t('client.general.save')}
                    onClick={this.handleSave}
                />
            </div>
        );

        return (
            <Modal
                modalId={modalId}
                modalBody={modalBody}
                modalTitle={$t('client.general.default_parameters')}
                modalFooter={modalFooter}
                onBeforeOpen={this.handleOpen}
            />
        );
    }
}

DefaultParamsModal.propTypes = {
    // Unique identifier of the modal
    modalId: PropTypes.string.isRequired,

    // The current default threshold
    threshold: PropTypes.string.isRequired,

    // The function to set the default threshold to detect duplicates
    setThreshold: PropTypes.func.isRequired
};

const Export = connect(
    state => {
        return {
            threshold: get.setting(state, 'duplicateThreshold')
        };
    },
    dispatch => {
        return {
            setThreshold(val) {
                actions.setSetting(dispatch, 'duplicateThreshold', val);
            }
        };
    }
)(DefaultParamsModal);

export default Export;
