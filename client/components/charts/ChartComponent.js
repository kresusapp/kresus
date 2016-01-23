import { NYI } from '../../helpers.js';

export default class ChartComponent extends React.Component {

    redraw() {
        NYI();
    }

    componentDidUpdate() {
        this.redraw();
    }

    componentDidMount() {
        // Force update!
        this.setState({});
    }

}
