import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../store';

import { translate as $t } from '../../helpers';

import SaveAndCancel from '../ui/modal-save-and-cancel';

// The modal body
const Body = connect(
    state => {
        return {
            state: get.modal(state).state
        };
    },
    dispatch => {
        return {
            handleChange(event) {
                actions.showModal(dispatch, 'duplicates-default', event.target.value);
            }
        };
    }
)(props => {
    return (
        <div className="form-group clearfix">
            <label htmlFor="duplicateThreshold" className="col-xs-4 control-label">
                {$t('client.similarity.default_threshold')}
            </label>
            <div className="col-xs-8">
                <div className="input-group">
                    <input
                        id="duplicateThreshold"
                        type="number"
                        className="form-control"
                        min="0"
                        step="1"
                        value={props.state}
                        onChange={props.handleChange}
                    />
                    <span className="input-group-addon">{$t('client.units.hours')}</span>
                </div>
                <span className="help-block">{$t('client.similarity.default_help')}</span>
            </div>
        </div>
    );
});

// The modal footer
const Footer = connect(
    state => {
        let modalState = get.modal(state).state;

        return {
            state: modalState,
            isSaveDisabled: modalState === get.setting(state, 'duplicateThreshold')
        };
    },
    dispatch => {
        return { dispatch };
    },
    (stateToProps, { dispatch }) => {
        return {
            handleSave() {
                actions.setSetting(dispatch, 'duplicateThreshold', stateToProps.state);
            },
            isSaveDisabled: stateToProps.isSaveDisabled
        };
    }
)(SaveAndCancel);

// The button to open the modal
export const ShowButton = connect(
    state => {
        return {
            threshold: get.setting(state, 'duplicateThreshold')
        };
    },
    dispatch => {
        return {
            dispatch
        };
    },
    (stateToProps, { dispatch }) => {
        return {
            handleOpenModal() {
                actions.showModal(dispatch, 'duplicates-default', stateToProps.threshold);
            }
        };
    }
)(props => {
    return (
        <span
            className="option-legend fa fa-cog"
            title={$t('client.general.default_parameters')}
            onClick={props.handleOpenModal}
        />
    );
});

export function makeDuplicatesDetails() {
    return {
        title: $t('client.general.default_parameters'),
        footer: <Footer />,
        body: <Body />
    };
}
