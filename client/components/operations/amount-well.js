import React from 'react';

import { assertHas } from '../../helpers';

export default props => {
    assertHas(props, 'className');
    assertHas(props, 'icon');
    assertHas(props, 'title');
    assertHas(props, 'subtitle');
    assertHas(props, 'content');

    return (
        <div className={`well ${props.className}`}>
            <span className="well-icon">
                <i className={`fa fa-${props.icon}`} />
            </span>
            <span className="operation-amount">{props.content}</span>
            <br />
            <span className="well-title">{props.title}</span>
            <br />
            <span className="well-sub">{props.subtitle}</span>
        </div>
    );
};
