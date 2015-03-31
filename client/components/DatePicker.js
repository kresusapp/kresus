import {maybeHas} from '../Helpers';

export default class DatePicker extends React.Component {

    constructor(props) {
        super(props);
        this.pickadate = null;
    }

    componentDidMount() {
        this.pickadate = $(this.refs.elem.getDOMNode()).pickadate().pickadate('picker');
        this.pickadate.on('set', (value) => {
            if (maybeHas(value, 'clear')) {
                this.props.onSelect && this.props.onSelect(null);
            } else if (maybeHas (value, 'select')) {
                this.props.onSelect && this.props.onSelect(+new Date(value.select));
            }
        });
    }

    render() {
        return <input className="form-control" type="text" ref="elem" />
    }

};
