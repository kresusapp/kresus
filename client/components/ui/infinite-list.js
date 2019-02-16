import React from 'react';
import PropTypes from 'prop-types';

import throttle from 'lodash.throttle';

// Throttling for the scroll event (ms)
const SCROLL_THROTTLING = 150;

export default class InfiniteList extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            firstItem: 0,
            // Use window since the container does not exist in the DOM yet.
            lastItem: window.innerHeight / this.props.itemHeight
        };

        this.handleScroll = throttle(this.handleScroll, SCROLL_THROTTLING);
    }

    componentDidMount() {
        document
            .getElementById(this.props.containerId)
            .addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        document
            .getElementById(this.props.containerId)
            .removeEventListener('scroll', this.handleScroll);
    }

    handleScroll = e => {
        if (e) {
            e.preventDefault();
        }

        let { getHeightAbove, itemHeight, ballast } = this.props;

        let container = e.target;
        let topItemH = Math.max(container.scrollTop - getHeightAbove(), 0);
        let bottomItemH = topItemH + container.clientHeight;

        let firstItem = Math.max((topItemH / itemHeight - ballast) | 0, 0);
        let lastItem = Math.min(((bottomItemH / itemHeight) | 0) + ballast, this.props.numItems);

        // Avoid re-renders for small scroll events.
        if (this.state.firstItem !== firstItem || this.state.lastItem !== lastItem) {
            this.setState({
                firstItem,
                lastItem
            });
        }
    };

    render() {
        let { itemHeight, numItems } = this.props;
        let { firstItem, lastItem } = this.state;
        let bufferPreH = itemHeight * firstItem;
        let bufferPostH = itemHeight * (numItems - lastItem);

        let items = this.props.renderItems(firstItem, lastItem);
        return (
            <tbody>
                <tr style={{ height: bufferPreH }} />
                {items}
                <tr style={{ height: bufferPostH }} />
            </tbody>
        );
    }
}

InfiniteList.propTypes = {
    // Number of operations before / after the ones to render, for fast scroll.
    ballast: PropTypes.number.isRequired,

    // Total number of items in the list.
    numItems: PropTypes.number.isRequired,

    // Height of a single item in the list.
    itemHeight: PropTypes.number.isRequired,

    // Function returning the space between the component and window's top.
    getHeightAbove: PropTypes.func.isRequired,

    // Function to be called for rendering all the items, with the signature:
    // (firstItem: Number, lastItem: Number) -> [React elements]
    renderItems: PropTypes.func.isRequired,

    // The list container html identifier
    containerId: PropTypes.string.isRequired
};
