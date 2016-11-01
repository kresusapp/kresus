import React from 'react';

import { assertHas } from '../../helpers';

export default props => {
    assertHas(props, 'backgroundColor');
    assertHas(props, 'size');
    assertHas(props, 'icon');
    assertHas(props, 'title');
    assertHas(props, 'subtitle');
    assertHas(props, 'content');

    let style = `well ${props.backgroundColor}`;

    return (
        <div className={ props.size }>
            <div className={ style }>
                <span className="well-icon">
                    <i className={ `fa fa-${props.icon}` } />
                </span>
                <span className="operation-amount">
                    { props.content }
                </span><br />
                <span className="well-title">{ props.title }</span><br />
                <span className="well-sub">{ props.subtitle }</span>
            </div>
        </div>
    );
};
