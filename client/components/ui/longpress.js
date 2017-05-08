import React from 'react';
import ReactDOM from 'react-dom';

import { assertHas } from '../../helpers';

const LONG_PRESS_DURATION = 500;

function withLongPress(WrappedComponent) {

    return class extends React.Component {

        constructor(props) {
            assertHas(props, 'onLongPress');

            super(props);

            this.element = null;
            this.timer = null;
            this.pressStart = 0;

            this.onPressStart = this.onPressStart.bind(this);
            this.onPressStop = this.onPressStop.bind(this);
            this.onContextMenu = this.onContextMenu.bind(this);
        }

        onContextMenu(event) {
            event.preventDefault();
            event.stopPropagation();
        }

        onPressStart(event) {
            clearTimeout(this.timer);
            this.pressStart = Date.now();
            this.timer = setTimeout(this.props.onLongPress, LONG_PRESS_DURATION);
            event.target.addEventListener('touchend', this.onPressStop);
            event.target.addEventListener('touchmove', this.onPressStop);
            event.target.addEventListener('contextmenu', this.onContextMenu);
        }

        onPressStop(event) {
            // Prevent clicks to happen after a long press
            if (event.type === 'touchend' && (Date.now() - this.pressStart) > LONG_PRESS_DURATION) {
                event.preventDefault();
            }

            event.target.removeEventListener('touchend', this.onPressStop);
            event.target.removeEventListener('touchmove', this.onPressStop);
            event.target.removeEventListener('contextmenu', this.onContextMenu);

            clearTimeout(this.timer);
            this.pressStart = 0;
        }

        componentDidMount() {
            ReactDOM.findDOMNode(this.element).addEventListener('touchstart', this.onPressStart);
        }

        componentWillUnMount() {
            let domElement = ReactDOM.findDOMNode(this.element);
            domElement.removeEventListener('touchstart', this.onPressStart);
            domElement.removeEventListener('touchend', this.onPressStart);
            domElement.removeEventListener('touchmove', this.onPressStart);
            domElement.removeEventListener('contextmenu', this.onPressStart);
        }

        render() {
            let refComponent = node => {
                this.element = node;
            };

            return (
                <WrappedComponent
                  { ...this.props }
                  ref={ refComponent }
                />
            );
        }
    };
}

export default withLongPress;
