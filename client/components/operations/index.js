import React from 'react';
import ReactDOM from 'react-dom';

import { connect } from 'react-redux';

import { translate as $t } from '../../helpers';

import { get } from '../../store';

import InfiniteList from '../ui/infinite-list';
import withLongPress from '../ui/longpress';

import Wells from './wells';
import DetailsModal from './details';
import SearchComponent from './search';
import OperationItem from './item';
import SyncButton from './sync-button';

// Infinite list properties.
const OPERATION_BALLAST = 10;

const PressableOperationItem = withLongPress(OperationItem);

// Keep in sync with style.css.
function computeOperationHeight(isSmallScreen) {
    return isSmallScreen ? 41 : 54;
}

class OperationsComponent extends React.Component {

    constructor(props) {
        super(props);

        this.renderItems = this.renderItems.bind(this);
        this.computeHeightAbove = this.computeHeightAbove.bind(this);
        this.getOperationHeight = this.getOperationHeight.bind(this);
        this.getNumItems = this.getNumItems.bind(this);

        this.operationHeight = computeOperationHeight(this.props.isSmallScreen);

        this.selectModalOperation = this.selectModalOperation.bind(this);

        this.detailsModal = null;
        this.operationPanel = null;
        this.panelHeading = null;
        this.thead = null;
    }

    selectModalOperation(operationId) {
        this.detailsModal.setOperationId(operationId);
    }

    // Implementation of infinite list.
    renderItems(low, high) {
        return this.props.filteredOperations
                         .slice(low, high)
                         .map(o => {
                             let handleOpenModal = () => this.selectModalOperation(o.id);
                             return (
                                 <PressableOperationItem
                                   key={ o.id }
                                   operationId={ o.id }
                                   formatCurrency={ this.props.account.formatCurrency }
                                   onOpenModal={ handleOpenModal }
                                   onLongPress={ handleOpenModal }
                                 />
                             );
                         });
    }

    componentDidMount() {
        // Called after first render => safe to use findDOMNode.
        let heightAbove = ReactDOM.findDOMNode(this.operationPanel).offsetTop;
        heightAbove += ReactDOM.findDOMNode(this.panelHeading).scrollHeight;
        heightAbove += ReactDOM.findDOMNode(this.thead).scrollHeight;

        this.heightAbove = heightAbove;

        this.operationHeight = computeOperationHeight(this.props.isSmallScreen);
    }

    computeHeightAbove() {
        return this.heightAbove;
    }

    getOperationHeight() {
        return this.operationHeight;
    }

    getNumItems() {
        return this.props.filteredOperations.length;
    }
    // End of implementation of infinite list.

    render() {
        let { formatCurrency } = this.props.account;

        let refDetailsModal = node => {
            this.detailsModal = node;
        };
        let refOperationPanel = node => {
            this.operationPanel = node;
        };
        let refPanelHeading = node => {
            this.panelHeading = node;
        };
        let refThead = node => {
            this.thead = node;
        };

        return (
            <div>
                <DetailsModal
                  ref={ refDetailsModal }
                  formatCurrency={ formatCurrency }
                />

                <Wells account={ this.props.account } />

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
                        <SyncButton account={ this.props.account } />
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
                            <InfiniteList
                              ballast={ OPERATION_BALLAST }
                              getNumItems={ this.getNumItems }
                              getItemHeight={ this.getOperationHeight }
                              getHeightAbove={ this.computeHeightAbove }
                              renderItems={ this.renderItems }
                              containerId="content"
                            />
                        </table>
                    </div>

                </div>

            </div>
        );
    }
}

const Export = connect((state, ownProps) => {
    let accountId = ownProps.match.params.currentAccountId;
    let account = get.accountById(state, accountId);
    let filteredOperations = get.filteredOperationsByAccountId(state, accountId);

    return {
        account,
        filteredOperations
    };
})(OperationsComponent);

export default Export;
