import React from 'react';

import { translate as $t } from '../../helpers';

export default props => {
    let message = props.message || $t('client.spinner.generic');

    return (<div className="row">
        <div className="col-sm-3 hidden-xs" />
        <div className="col-sm-6 col-xs-12">
            <div className="top-panel panel panel-default">
                <div className="panel-heading">
                    <h3 className="text-center">
                        { $t('client.spinner.title') }
                    </h3>
                </div>
                <div className="panel-body text-center">
                    <div className="spinner"/>
                    { message }
                </div>
            </div>
        </div>
    </div>);
};
