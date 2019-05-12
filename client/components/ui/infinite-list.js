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

    static propTypes = {
        // Number of operations before / after the ones to render, for fast scroll.
        // As the prop is used in a static function, the linter does not detect it is used.
        // eslint-disable-next-line react/no-unused-prop-types
        ballast: PropTypes.number.isRequired,

        // The list of items to be rendered.
        items: PropTypes.instanceOf(Array).isRequired,

        // Height of a single item in the list.
        itemHeight: PropTypes.number.isRequired,

        // The space between the component and window's top.
        // As the prop is used in a static function, the linter does not detect it is used.
        // eslint-disable-next-line react/no-unused-prop-types
        heightAbove: PropTypes.number.isRequired,

        // Function to be called for rendering all the items, with the signature:
        // (items: Array, firstItem: Number, lastItem: Number) -> [React elements]
        renderItems: PropTypes.func.isRequired,

        // The list container html identifier
        containerId: PropTypes.string.isRequired
    };

    static stateFromPropsAndContainer(container, props, state) {
        let { heightAbove, itemHeight, items, ballast } = props;

        let topItemH = Math.max(container.scrollTop - heightAbove, 0);
        let bottomItemH = topItemH + container.clientHeight;
        let firstItem = Math.max((topItemH / itemHeight - ballast) | 0, 0);
        let lastItem = Math.min(((bottomItemH / itemHeight) | 0) + ballast, items.length);

        // Avoid re-renders for small scroll events.
        if (state.firstItem !== firstItem || state.lastItem !== lastItem) {
            return {
                firstItem,
                lastItem
            };
        }

        return null;
    }

    static getDerivedStateFromProps(props, state) {
        let container = document.getElementById(props.containerId);

        // The list is not mounted yet, no need to recompute the state.
        if (container === null) {
            return null;
        }

        return InfiniteList.stateFromPropsAndContainer(container, props, state);
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

        // Pass a function instead of a value to this.setState to allow batch updates.
        this.setState((state, props) => {
            return InfiniteList.stateFromPropsAndContainer(e.target, props, state);
        });
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
