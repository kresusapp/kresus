import React from 'react';

export default class SelectableButtonComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            editMode: false
        };
        this.handleToggleEdit = this.handleToggleEdit.bind(this);
        this.handleToggleStatic = this.handleToggleStatic.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    dom() {
        return this.refs.select;
    }

    handleChange() {
        let selectedId = this.dom().value;
        this.props.onSelectId(selectedId);
        this.handleToggleStatic();
    }

    handleToggleEdit() {
        this.setState({ editMode: true }, function() {
            this.dom().focus();
        });
    }

    handleToggleStatic() {
        this.setState({ editMode: false });
    }

    render() {
        let selectedId = this.props.selectedId();
        let label = this.props.idToLabel(selectedId);

        if (!this.state.editMode) {
            return (
                <button
                  className="form-control btn-transparent label-button"
                  onClick={ this.handleToggleEdit }
                  onFocus={ this.handleToggleEdit }>
                    { label }
                </button>
            );
        }

        let options = this.props.optionsArray.map(o =>
            <option key={ o.id } value={ o.id } className="label-button">
                { this.props.idToLabel(o.id) }
            </option>
        );

        return (
            <select className="form-control"
              onChange={ this.handleChange }
              onBlur={ this.handleToggleStatic }
              defaultValue={ selectedId }
              ref="select" >
                { options }
            </select>
        );
    }
}
