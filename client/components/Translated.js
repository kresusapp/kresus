import {translate as t} from '../Helpers';

export default class Translated extends React.Component {
    render() {
        let cx = this.props.cx || {};
        let translation = t(this.props.k, cx);
        if (!translation) {
            translation = this.props.children;
        }
        return <span>{translation}</span>
    }
};

