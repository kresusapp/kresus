import React from 'react';

import throttle from 'lodash.throttle';

// Throttling for the scroll event (ms)
const SCROLL_THROTTLING = 150;

export default class InfiniteList extends React.Component {

    constructor(props) {
        super(props);

        let itemHeight = this.props.getItemHeight();

        this.state = {
            firstItemShown: 0,
            lastItemShown: window.innerHeight / itemHeight,
            itemHeight
        };

        this.handleScroll = throttle(this.handleScroll.bind(this), SCROLL_THROTTLING);
        this.handleResize = this.handleResize.bind(this);
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize(e) {
        e.preventDefault();
        this.props.onResizeUser();
        this.handleScroll();
    }

    handleScroll(e) {
        if (e)
            e.preventDefault();

        let heightAbove = this.props.getHeightAbove();

        let topItemH = Math.max(window.scrollY - heightAbove, 0);
        let bottomItemH = topItemH + window.innerHeight;

        let itemHeight = this.props.getItemHeight();
        let ballast = this.props.ballast;

        let firstItemShown = Math.max((topItemH / itemHeight) - ballast | 0, 0);
        let lastItemShown = (bottomItemH / itemHeight | 0) + this.props.ballast;

        this.setState({
            firstItemShown,
            lastItemShown,
            itemHeight
        });
    }

    render() {
        let bufferPreH = this.state.itemHeight * this.state.firstItemShown;

        let items = this.props.renderItems(this.state.firstItemShown, this.state.lastItemShown);

        let bufferPostH = this.state.itemHeight *
                          Math.max(this.props.getNumItems() - this.state.lastItemShown, 0);

        return (<tbody>
            <tr style={ { height: `${bufferPreH}px` } } />
            { items }
            <tr style={ { height: `${bufferPostH}px` } } />
        </tbody>);
    }
}

InfiniteList.propTypes = {
    // Number of operations before / after the ones to render, for fast scroll.
    ballast: React.PropTypes.number.isRequired,

    // Function returning the total number of items in the list.
    getNumItems: React.PropTypes.func.isRequired,

    // Function returning the space between the component and window's top.
    getItemHeight: React.PropTypes.func.isRequired,

    // Function returning the height of a single item in the list.
    getHeightAbove: React.PropTypes.func.isRequired,

    // Function to be called for rendering all the items, with the signature:
    // (firstItemShown: Number, lastItemShown: Number) -> [React elements]
    renderItems: React.PropTypes.func.isRequired,

    // Function called on each window resize.
    onResizeUser: React.PropTypes.func
};
