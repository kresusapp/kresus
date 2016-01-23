export default class SelectableButtonComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            editMode: false
        };
    }

    dom() {
        return this.refs.select.getDOMNode();
    }

    onChange(e) {
        let selectedId = this.dom().value;
        this.props.onSelectId(selectedId);
        this.switchToStaticMode();
    }

    switchToEditMode() {
        this.setState({ editMode: true }, function() {
            this.dom().focus();
        });
    }

    switchToStaticMode() {
        this.setState({ editMode: false });
    }

    render() {
        let selectedId = this.props.selectedId();
        let label = this.props.idToLabel(selectedId);

        if (!this.state.editMode) {
            return (
                <button
                  className="form-control btn-transparent label-button"
                  onClick={this.switchToEditMode.bind(this)}>
                    {label}
                </button>
            );
        }
        let options = this.props.optionsArray.map(o => {
            return <option key={o.id} value={o.id} className="label-button">{this.props.idToLabel(o.id)}</option>;
        });

        return (
            <select className="form-control"
              onChange={this.onChange.bind(this)}
              onBlur={this.switchToStaticMode.bind(this)}
              defaultValue={selectedId}
              ref='select' >
                {options}
            </select>
        );
    }
}
