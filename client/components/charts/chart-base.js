import React from 'react';

export default class ChartComponent extends React.Component {
    container = null;

    componentWillUnmount() {
        if (this.container !== null) {
            this.container.destroy();
            this.container = null;
        }
    }

    redraw() {
        window.alert('not yet implemented');
    }

    componentDidUpdate() {
        this.redraw();
    }

    componentDidMount() {
        this.redraw();
    }
}
