import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { get, actions } from '../../store';
import { translate as $t } from '../../helpers';
import { DISCOVERY_MODE } from '../../../shared/settings';

import DisplayIf from './display-if';
import { Popconfirm } from './index';

const DiscoveryMessage = connect(
    state => {
        return {
            enabled: get.boolSetting(state, DISCOVERY_MODE),
        };
    },
    dispatch => {
        return {
            handleDisable() {
                actions.setBoolSetting(dispatch, DISCOVERY_MODE, false);
            },
        };
    }
)(props => {
    return (
        <DisplayIf condition={props.enabled}>
            <p className="alerts info with-action">
                <span>{props.message}</span>
                <Popconfirm
                    trigger={<button className="fa fa-times-circle" />}
                    onConfirm={props.handleDisable}
                    confirmMessage="success">
                    <h3>{$t('client.settings.customization.discovery')}</h3>
                    <p>{$t('client.settings.customization.confirm_disable_discovery')}</p>
                </Popconfirm>
            </p>
        </DisplayIf>
    );
});

DiscoveryMessage.propTypes = {
    // The help message to display.
    message: PropTypes.string.isRequired,
};

export default DiscoveryMessage;
