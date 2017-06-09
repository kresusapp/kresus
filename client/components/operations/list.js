import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import OperationItem from './item';
import InfiniteList from '../ui/infinite-list';

import { get } from '../../store';

// Infinite list properties.
const OPERATION_BALLAST = 10;

// Keep in sync with style.css.
function computeOperationHeight(isSmallScreen) {
    return isSmallScreen ? 41 : 54;
}

const List = props => {
    return (
        <InfiniteList
          ballast={ OPERATION_BALLAST }
          getNumItems={ props.getNumItems }
          getItemHeight={ props.getItemHeight }
          getHeightAbove={ props.getHeightAbove }
          renderItems={ props.renderItems }
          containerId="content"
        />
    );
};

const Export = connect((state, props) => {
    let filteredOperations = get.filteredOperationsByAccountId(state, props.account.id);

    // Function to render a series of operations.
    const renderItems = (low, high) => {
        return filteredOperations
                         .slice(low, high)
                         .map(o => {
                             return (
                                 <OperationItem
                                   key={ o.id }
                                   operationId={ o.id }
                                   formatCurrency={ props.account.formatCurrency }
                                   onOpenModal={ props.onOpenModal }
                                 />
                             );
                         });
    };

    // Function to get the full number of operations to be displayed.
    const getNumItems = () => filteredOperations.length;

    // Function to get the operation height depending on size of screen.
    const getItemHeight = () => computeOperationHeight(props.isSmallScreen);

    return {
        renderItems,
        getNumItems,
        getItemHeight
    };
})(List);

Export.propTypes = {
    // The account for which the operations have to be displayed.
    account: PropTypes.object.isRequired,

    // A boolean telling whether the screen is small or not.
    isSmallScreen: PropTypes.bool.isRequired,

    // A function which allows to get the height of the components above this component.
    getHeightAbove: PropTypes.func.isRequired,

    // A function to open the modal.
    onOpenModal: PropTypes.func.isRequired
};

export default Export;
