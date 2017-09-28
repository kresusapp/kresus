import React from 'react';
import PropTypes from 'prop-types';

const BoolSetting = props => (
    <div className="form-group clearfix">
        <label className="col-xs-4 control-label">{props.label}</label>
        <div className="col-xs-8">
            <input type="checkbox" defaultChecked={props.checked} onChange={props.onChange} />
        </div>
    </div>
);

BoolSetting.propTypes = {
    // Label describing what the setting is all about.
    label: PropTypes.string.isRequired,

    // Whether the checkbox is currently checked or not.
    checked: PropTypes.bool.isRequired,

    // Function to call whenever the value changes.
    onChange: PropTypes.func.isRequired
};

export default BoolSetting;
