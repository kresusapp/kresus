import React from 'react';

import { assert } from '../../helpers';

const LONG_PRESS_DURATION = 500;

class LongPress extends React.Component {
    constructor(props) {
        super(props);

        this.element = null;
        this.timer = null;
        this.pressStart = 0;

        this.elementCb = this.elementCb.bind(this);
        this.onPressStart = this.onPressStart.bind(this);
        this.onPressStop = this.onPressStop.bind(this);
        this.onLongPress = this.onLongPress.bind(this);
    }

    elementCb(node) {
        this.element = node;
    }

    onPressStart(event) {
        clearTimeout(this.timer);
        this.pressStart = Date.now();
        this.timer = setTimeout(this.onLongPress, LONG_PRESS_DURATION);
        event.target.addEventListener('touchend', this.onPressStop);
        event.target.addEventListener('touchmove', this.onPressStop);
    }

    onPressStop(event) {
        // Prevent clicks to happen after a long press
        if (event.type === 'touchend' && (Date.now() - this.pressStart) > LONG_PRESS_DURATION) {
            event.preventDefault();
        }

        event.target.removeEventListener('touchend', this.onPressStop);
        event.target.removeEventListener('touchmove', this.onPressStop);

        clearTimeout(this.timer);
        this.pressStart = 0;
    }

    componentDidMount() {
        assert(this.element, 'The element property should be defined by the child class');

        this.element.addEventListener('touchstart', this.onPressStart);
    }

    componentWillUnMount() {
        assert(this.element, 'The element property should be defined by the child class');

        this.element.removeEventListener('touchstart', this.onPressStart);
        this.element.removeEventListener('touchend', this.onPressStop);
        this.element.removeEventListener('touchmove', this.onPressStop);
    }

    onLongPress() {
        assert(false, 'This method must be overridden');
    }

    render() {
        // The elementCb method must be used as the ref callback so that the
        // component can register touch events listeners on the component.
        assert(false, 'This method must be overridden');
        return null;
    }
}

export default LongPress;
