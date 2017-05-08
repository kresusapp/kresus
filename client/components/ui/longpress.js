import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const LONG_PRESS_DURATION = 500;

function withLongPress(WrappedComponent) {

    class WithLongPressComponent extends React.Component {

        constructor(props) {
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
            event.target.addEventListener('touchcancel', this.onPressStop);
            event.target.addEventListener('contextmenu', this.onContextMenu);
        }

        onPressStop(event) {
            // Prevent clicks to happen after a long press
            if (event.type === 'touchend' && (Date.now() - this.pressStart) > LONG_PRESS_DURATION) {
                event.preventDefault();
            }

            event.target.removeEventListener('touchend', this.onPressStop);
            event.target.removeEventListener('touchmove', this.onPressStop);
            event.target.removeEventListener('touchcancel', this.onPressStop);
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
            domElement.removeEventListener('touchend', this.onPressStop);
            domElement.removeEventListener('touchmove', this.onPressStop);
            domElement.removeEventListener('touchcancel', this.onPressStop);
            domElement.removeEventListener('contextmenu', this.onContextMenu);
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
    }

    WithLongPressComponent.propTypes = {
        // The callback called when a longpress occurred on the component.
        onLongPress: PropTypes.func.isRequired
    };

    return WithLongPressComponent;
}

export default withLongPress;
