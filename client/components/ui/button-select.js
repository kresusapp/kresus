import React from 'react';
import PropTypes from 'prop-types';

class SelectableButtonComponent extends React.Component {

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        console.log(event)
        this.props.onSelectId(this.props.selectedId, event.target.value);
    }

    render() {
        let selectedId = this.props.selectedId;
        let { label, color } = this.props.mapIdToDescriptor[selectedId];

        let options = this.props.optionsArray.map(id => (
                <option
                  key={ id }
                  value={ id }>
                    { this.props.mapIdToDescriptor[id].label }
                </option>
            ));


        let borderColor;
        if (color) {
            borderColor = { borderRight: `5px solid ${color}` };
        }

        return (
            <select
              className="form-control btn-transparent"
              style={ borderColor }
              onChange={ this.handleChange }
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
