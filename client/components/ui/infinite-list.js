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
            lastItem: (window.innerHeight / this.props.itemHeight) | 0
        };

        this.handleScroll = throttle(this.handleScroll, SCROLL_THROTTLING);
    }

    componentDidMount() {
        let container = document.getElementById(this.props.containerId);
        container.addEventListener('scroll', this.handleScroll);

        // Ensure the top of the list is always visible when remounting the component.
        container.scrollTop = 0;
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

        let { getHeightAbove, itemHeight, items, ballast } = this.props;

        let container = e.target;
        let topItemH = Math.max(container.scrollTop - getHeightAbove(), 0);
        let bottomItemH = topItemH + container.clientHeight;

        let firstItem = Math.max((topItemH / itemHeight - ballast) | 0, 0);
        let lastItem = Math.min(((bottomItemH / itemHeight) | 0) + ballast, items.length);

        // Avoid re-renders for small scroll events.
        if (this.state.firstItem !== firstItem || this.state.lastItem !== lastItem) {
            this.setState({
                firstItem,
                lastItem
            });
        }
    };

    render() {
        let { itemHeight, items } = this.props;

        if (items.length === 0) {
            return null;
        }

        let { firstItem, lastItem } = this.state;
        let bufferPreH = itemHeight * firstItem;
        let bufferPostH = Math.max(itemHeight * (items.length - lastItem), 0);
        let renderedItems = this.props.renderItems(items, firstItem, lastItem);
        return (
            <tbody>
                <tr style={{ height: bufferPreH }} />
                {renderedItems}
                <tr style={{ height: bufferPostH }} />
            </tbody>
        );
    }
}

InfiniteList.propTypes = {
    // Number of operations before / after the ones to render, for fast scroll.
    ballast: PropTypes.number.isRequired,

    // The list of items to be rendered.
    items: PropTypes.instanceOf(Array).isRequired,

    // Height of a single item in the list.
    itemHeight: PropTypes.number.isRequired,

    // Function returning the space between the component and window's top.
    getHeightAbove: PropTypes.func.isRequired,

    // Function to be called for rendering all the items, with the signature:
    // (items: Array, firstItem: Number, lastItem: Number) -> [React elements]
    renderItems: PropTypes.func.isRequired,

    // The list container html identifier
    containerId: PropTypes.string.isRequired
};
