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
        this.handleRef = this.handleRef.bind(this);
    }

    handleRef(node) {
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
            // The use of setImmediate is here to have this work with firefox:
            // firefox doesn't handle well node.focus() in onfocus/onblur handlers.
            setImmediate(() => {
                this.select.focus();
            });
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

        if (!this.state.editMode) {
            return (
                <button
                  className="form-control btn-transparent label-button"
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
              size={ 1 }
              onBlur={ this.handleToggleStatic }
              defaultValue={ selectedId }
              ref={ this.handleRef }
              onKeyUp={ this.handleKeyUp } >
                { options }
            </select>
        );
    }
}
