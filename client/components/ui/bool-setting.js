import React from 'react'; // implicitly used

export default (props) =>
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

