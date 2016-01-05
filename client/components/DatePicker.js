import {maybeHas} from '../helpers';

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
                let actualDate = new Date(value.select);

                // pickadate returns UTC time, fix the timezone offset.
                actualDate.setMinutes(actualDate.getMinutes() - actualDate.getTimezoneOffset());

                this.props.onSelect && this.props.onSelect(+actualDate);
            }
        });
    }

    clear() {
        this.refs.elem.getDOMNode().value = '';
    }

    render() {
        return <input className="form-control" type="text" ref="elem" />
    }

};
