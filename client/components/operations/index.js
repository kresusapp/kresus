import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import { translate as $t } from '../../helpers';

import { get } from '../../store';

import Wells from './wells';
import DetailsModal from './details';
import SearchComponent from './search';
import SyncButton from './sync-button';
import OperationsList from './list';

const Report = props => {
    let { formatCurrency } = props.account;

    let detailsModal = null;
    let operationPanel = null;
    let panelHeading = null;
    let thead = null;

    // Ref callbacks
    const refDetailsModal = node => {
        detailsModal = node;
    };
    const refOperationPanel = node => {
        operationPanel = node;
    };
    const refPanelHeading = node => {
        panelHeading = node;
    };
    const refThead = node => {
        thead = node;
    };

    const getHeightAbove = () => {
        let heightAbove = operationPanel.offsetTop;
        heightAbove += panelHeading.scrollHeight;
        heightAbove += thead.scrollHeight;
        return heightAbove;
    };

    const handleOpenModal = operationId => () => detailsModal.setOperationId(operationId);

    return (
        <div>
            <DetailsModal
              ref={ refDetailsModal }
              formatCurrency={ formatCurrency }
            />

            <Wells account={ props.account } />

            <SearchComponent />

            <div
              className="operation-panel panel panel-default"
              ref={ refOperationPanel }>
                <div
                  className="panel-heading"
                  ref={ refPanelHeading }>
                    <h3 className="title panel-title">
                        { $t('client.operations.title') }
                    </h3>
                    <SyncButton account={ props.account } />
                </div>

                <div className="table-responsive">
                    <table className="table table-hover table-bordered">
                        <thead ref={ refThead }>
                            <tr>
                                <th className="hidden-xs" />
                                <th className="col-sm-1 col-xs-2">
                                    { $t('client.operations.column_date') }
                                </th>
                                <th className="col-sm-2 hidden-xs">
                                    { $t('client.operations.column_type') }
                                </th>
                                <th className="col-sm-6 col-xs-8">
                                    { $t('client.operations.column_name') }
                                </th>
                                <th className="col-sm-1 col-xs-2">
                                    { $t('client.operations.column_amount') }
                                </th>
                                <th className="col-sm-2 hidden-xs">
                                    { $t('client.operations.column_category') }
                                </th>
                            </tr>
                        </thead>

                        <OperationsList
                          accountId={ props.currentAccountId }
                          isSmallScreen={ props.isSmallScreen }
                          getHeightAbove={ getHeightAbove }
                          onOpenModal={ handleOpenModal }
                        />
                    </table>
                </div>

            </div>
        </div>
    );
};

const Export = connect((state, ownProps) => {
    return {
        account: get.accountById(state, ownProps.currentAccountId)
    };
})(Report);

Export.propTypes = {
    // This id of the account for which the operations have to be displayed.
    currentAccountId: PropTypes.string.isRequired,

    // Tells wether the screen is small or not.
    isSmallScreen: PropTypes.bool.isRequired
};

export default Export;
