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
        let selectedId = this.props.selectedId;
        let { label, color } = this.props.mapIdToDescriptor[selectedId];

        let options = [];
        if (this.state.editMode) {
            options = this.props.optionsArray.map(id => (
                <option
                  key={ id }
                  value={ id }>
                    { this.props.mapIdToDescriptor[id].label }
                </option>
            ));
        } else {
            options = [
                <option
                  key={ selectedId }
                  value={ selectedId }>
                    { label }
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
              style={ borderColor }
              onChange={ this.handleChange }
              onClick={ this.handleToggleEdit }
              onFocus={ this.handleToggleEdit }
              onBlur={ this.handleToggleStatic }
              defaultValue={ selectedId }>
                { options }
            </select>
        );
    }
}

SelectableButtonComponent.propTypes = {
    // Callback whenever a new option is selected; will be called with the id
    // of the selected option.
    onSelectId: PropTypes.func.isRequired,

    // Which option (referred by id) is selected by default.
    selectedId: PropTypes.string.isRequired,

    // A key/value object mapping option id to descriptors.
    // key: id of option
    // value: { label: aLabel, color: aColor }
    mapIdToDescriptor: PropTypes.object.isRequired,

    // An array of options of the form [ id ].
    optionsArray: PropTypes.array.isRequired
};

export default SelectableButtonComponent;
