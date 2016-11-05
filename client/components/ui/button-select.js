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
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.refSelect = this.refSelect.bind(this);
    }

    refSelect(node) {
        this.select = node;
    }

    handleChange() {
        let selectedId = this.select.value;
        this.props.onSelectId(selectedId);
        this.handleToggleStatic();
    }

    handleToggleEdit() {
        this.setState({ editMode: true }, () => {
            // Set the focus on the select.
            // use setTimeout here to work around Firefox handling of focus() calls in onfocus
            // handlers
            setTimeout(() => {
                this.select.focus();
            }, 0);
        });
    }

    handleKeyUp(e) {
        if (e.key === 'Escape') {
            this.handleToggleStatic();
        }
    }

    handleToggleStatic() {
        this.setState({ editMode: false });
    }

    render() {
        let selectedId = this.props.selectedId();
        let label = this.props.idToLabel(selectedId);
        let borderColor;

        if (this.props.idToColor) {
            let color = this.props.idToColor(selectedId);
            if (color) {
                borderColor = { borderRight: `5px solid ${color}` };
            }
        }

        if (!this.state.editMode) {
            return (
                <button
                  className="form-control btn-transparent label-button"
                  style={ borderColor }
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
              style={ borderColor }
              onChange={ this.handleChange }
              size={ 1 }
              onBlur={ this.handleToggleStatic }
              defaultValue={ selectedId }
              ref={ this.refSelect }
              onKeyUp={ this.handleKeyUp } >
                { options }
            </select>
        );
    }
}
