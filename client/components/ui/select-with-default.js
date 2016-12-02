import React from 'react';

class SelectWithDefault extends React.Component {

    constructor(props, options) {
        super(props);
        this.options = options;
    }

    getValue() {
        return this.refs.selector.value;
    }

    render() {
        return (
            <select
              className="form-control"
              defaultValue={ this.props.defaultValue }
              onChange={ this.props.onChange }
              ref="selector"
              id={ this.props.htmlId }>
                { this.options }
            </select>
        );
    }
}

SelectWithDefault.propTypes = {
    // Initial value.
    defaultValue: React.PropTypes.string.isRequired,

    // Callback getting the id of the selected option whenever it changes.
    onChange: React.PropTypes.func.isRequired,

    // CSS unique id.
    htmlId: React.PropTypes.string.isRequired
};

export default SelectWithDefault;
