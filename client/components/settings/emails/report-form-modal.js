import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { actions, get } from '../../../store';
import { registerModal } from '../../ui/new-modal';

import AccountSelector from './account-select';

const MODAL_SLUG = 'report-creation';

const Body = connect(
    state => {
        return {
            ...get.modal(state).state
        };
    },
    dispatch => ({ dispatch }),
    (stateToProps, { dispatch }) => {
        return {
            createAlert(newAlert) {
                actions.createAlert(dispatch, newAlert);
            },
            handleChangeAccount(bankAccount) {
                actions.showModal(dispatch, MODAL_SLUG, { ...stateToProps, bankAccount });
            },
            handleChangeFrequency(event) {
                actions.showModal(dispatch, MODAL_SLUG, {
                    ...stateToProps,
                    frequency: event.target.value
                });
            }
        };
    }
)(props => {
    return (
        <div>
            <div className="form-group">
                <label htmlFor="account">{$t('client.settings.emails.account')}</label>
                <AccountSelector onChange={props.handleChangeAccount} />
            </div>
            let modalBody = (
            <div>
                <div className="form-group">
                    <label htmlFor="account">{$t('client.settings.emails.account')}</label>
                    <AccountSelector ref={this.refAccountSelector} id="account" />
                </div>

                <select className="form-control" onChange={props.handleChangeFrequency}>
                    <option value="daily">{$t('client.settings.emails.daily')}</option>
                    <option value="weekly">{$t('client.settings.emails.weekly')}</option>
                    <option value="monthly">{$t('client.settings.emails.monthly')}</option>
                </select>
            </div>
        </div>
    );
});

const Footer = connect(
    state => {
        return {
            ...get.modal(state).state
        };
    },
    dispatch => ({ dispatch }),
    (stateToProps, { dispatch }) => {
        return {
            handleSubmit() {
                actions.createAlert(dispatch, stateToProps);
            },
            handleCancel() {
                actions.hideModal(dispatch);
            }
        };
    }
)(props => {
    return (
        <div>
            <button type="button" className="btn btn-default" onClick={props.handleCancel}>
                {$t('client.general.cancel')}
            </button>
            <button
                type="button"
                className="btn btn-success"
                data-dismiss="modal"
                onClick={props.handleSubmit}>
                {$t('client.settings.emails.create')}
            </button>
        </div>
    );
});

registerModal(MODAL_SLUG, () => {
    return {
        title: $t('client.settings.emails.add_report'),
        body: <Body />,
        footer: <Footer />
    };
});

const ShowReportCreationModal = connect(null, dispatch => {
    return {
        handleClick() {
            actions.showModal(dispatch, MODAL_SLUG, { type: 'report' });
        }
    };
})(props => {
    return (
        <span
            className="option-legend fa fa-plus-circle"
            aria-label="create report"
            onClick={props.handleClick}
        />
    );
});

export default ShowReportCreationModal;
