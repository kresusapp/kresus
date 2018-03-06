import React from 'react';

import { translate as $t, formatDate } from '../../helpers';

export default props => {
    let customLabel = null;
    if (props.customLabel) {
        customLabel = <span>({props.customLabel})</span>;
    }

    return (
        <div>
            <div>
                <h3>
                    <span className="fa fa-question-circle clickable" title={props.rawLabel} />
                    {props.title}&nbsp;{customLabel}
                </h3>
                <p>
                    {formatDate.toShortString(props.date)}
                    &nbsp; ({$t('client.similarity.imported_on')}{' '}
                    {formatDate.toLongString(props.dateImport)})
                </p>
            </div>
            <div className="duplicate-details">
                <p>
                    <span className="label">{$t('client.similarity.category')}</span>
                    {props.categoryTitle}
                </p>
                <p>
                    <span className="label">{$t('client.similarity.type')}</span>
                    {$t(`client.${props.type}`)}
                </p>
            </div>
        </div>
    );
};
