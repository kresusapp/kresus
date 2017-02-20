import React from 'react';

const BoolSetting = props =>
    <div className="form-group clearfix">
        <label className="col-xs-4 control-label">
            { props.label }
        </label>
        <div className="col-xs-8">
            <input
              type="checkbox"
              defaultChecked={ props.checked }
              onChange={ props.onChange }
            />
        </div>
    </div>;

BoolSetting.propTypes = {
    // Label describing what the setting is all about.
    label: React.PropTypes.string.isRequired,

    // Whether the checkbox is currently checked or not.
    checked: React.PropTypes.bool.isRequired,

    // Function to call whenever the value changes.
    onChange: React.PropTypes.func.isRequired
};

export default BoolSetting;
