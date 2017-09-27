import React from "react";
import PropTypes from "prop-types";

// A ValidableInputText is a form group for a text input with a hint that it
// must not be empty.

class ValidableInputText extends React.Component {
  constructor(props) {
    super(props);

    this.refInput = node => {
      this.input = node;
    };

    this.state = { valid: false };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange() {
    let title = this.input.value.trim();
    let valid = title.length > 0;
    this.setState({ valid }, () => this.props.onChange(valid ? title : null));
  }

  clear() {
    this.input.value = "";
    this.handleChange();
  }

  render() {
    let iconClass = this.state.valid ? "fa-check" : "fa-times";
    iconClass = `fa ${iconClass} form-control-feedback`;

    return (
      <div className="form-group has-feedback">
        <label className="control-label" htmlFor={this.props.inputID}>
          {this.props.label}
        </label>

        <input
          type="text"
          className="form-control"
          id={this.props.inputID}
          ref={this.refInput}
          required={true}
          onChange={this.handleChange}
        />

        <span className={iconClass} aria-hidden="true" />
      </div>
    );
  }
}

ValidableInputText.propTypes = {
  // Callback receiving the validated text input.
  onChange: PropTypes.func.isRequired,

  // CSS id for the text input.
  inputID: PropTypes.string.isRequired,

  // Description of the text input (shown to the user).
  label: PropTypes.string.isRequired
};

export default ValidableInputText;
