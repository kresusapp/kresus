import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import OperationItem from './item';
import InfiniteList from '../ui/infinite-list';
import withLongPress from '../ui/longpress';

import { get } from '../../store';

// Infinite list properties.
const OPERATION_BALLAST = 10;

// Make operation pressable.
const PressableOperationItem = withLongPress(OperationItem);

// Keep in sync with style.css.
function computeOperationHeight(isSmallScreen) {
    return isSmallScreen ? 41 : 55;
}

const List = props => {
    let { filteredOperations } = props;

    // Function to render a series of operations.
    const renderItems = (low, high) => {
        return filteredOperations
                         .slice(low, high)
                         .map(id => {
                             return (
                                 <PressableOperationItem
                                   key={ id }
                                   operationId={ id }
                                   formatCurrency={ props.formatCurrency }
                                   onOpenModal={ props.onOpenModal(id) }
                                   onLongPress={ props.onOpenModal(id) }
                                   isSmallScreen={ props.isSmallScreen }
                                 />
                             );
                         });
    };

    // Function to get the full number of operations to be displayed.
    const getNumItems = () => filteredOperations.length;

    // Function to get the operation height depending on size of screen.
    const getItemHeight = () => computeOperationHeight(props.isSmallScreen);

    return (
        <InfiniteList
          ballast={ OPERATION_BALLAST }
          getNumItems={ getNumItems }
          getItemHeight={ getItemHeight }
          getHeightAbove={ props.getHeightAbove }
          renderItems={ renderItems }
          containerId="content"
        />
    );
};

const Export = connect((state, props) => {
    return {
        filteredOperations: get.filteredOperationsByAccountId(state, props.accountId),
        formatCurrency: get.accountById(state, props.accountId).formatCurrency
    };
})(List);

Export.propTypes = {
    // The account for which the operations have to be displayed.
    accountId: PropTypes.string.isRequired,

    // A boolean telling whether the screen is small or not.
    isSmallScreen: PropTypes.bool.isRequired,

    // A function which allows to get the height of the components above this component.
    getHeightAbove: PropTypes.func.isRequired,

    // A function to open the modal.
    onOpenModal: PropTypes.func.isRequired
};

export default Export;
