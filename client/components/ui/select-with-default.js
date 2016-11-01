import React from 'react';

import { assertHas } from '../../helpers';

export default class SelectWithDefault extends React.Component {

    constructor(props, options) {
        assertHas(props, 'defaultValue');
        assertHas(props, 'onChange');
        assertHas(props, 'htmlId');
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
