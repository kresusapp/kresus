import React from 'react';
import PropTypes from 'prop-types';

class SelectableButtonComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: false
        };
        this.handleToggleEdit = this.handleToggleEdit.bind(this);
        this.handleToggleStatic = this.handleToggleStatic.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.props.onSelectId(event.target.value);
    }

    handleToggleEdit() {
        this.setState({ editMode: true });
    }

    handleToggleStatic() {
        this.setState({ editMode: false });
    }

    render() {
        let selectedId = this.props.selectedId();
        let [label, color] = this.props.idToDescriptor(selectedId);

        let options = [];
        if (this.state.editMode) {
            options = this.props.optionsArray.map(o => (
                <option key={o.id} value={o.id}>
                    {this.props.idToDescriptor(o.id)[0]}
                </option>
            ));
        } else {
            options = [
                <option key={selectedId} value={selectedId}>
                    {label}
                </option>
            ];
        }

        let borderColor;
        if (color) {
            borderColor = { borderRight: `5px solid ${color}` };
        }

        return (
            <select
                className="form-control btn-transparent"
                style={borderColor}
                onChange={this.handleChange}
                onClick={this.handleToggleEdit}
                onFocus={this.handleToggleEdit}
                onBlur={this.handleToggleStatic}
                defaultValue={selectedId}>
                {options}
            </select>
        );
    }
}

SelectableButtonComponent.propTypes = {
    // Callback whenever a new option is selected; will be called with the id
    // of the selected option.
    onSelectId: PropTypes.func.isRequired,

    // Which option (referred by id) is selected by default.
    selectedId: PropTypes.func.isRequired,

    // A function mapping option id to descriptors.
    idToDescriptor: PropTypes.func.isRequired,

    // An array of options of the form {id: String}.
    optionsArray: PropTypes.array.isRequired
};

export default SelectableButtonComponent;
