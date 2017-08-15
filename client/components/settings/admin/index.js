import React from 'react';
import { connect } from 'react-redux';

import { get } from '../../../store';

import EmailParameters from './emails';
import WeboobParameters from './weboob';

let AdminSection = props => {
    // In the Cozy mode, no need to allow the user to configurate their own
    // email service, since the platform does it for us.
    let emailConfig = props.standalone ?
                      (<div>
                          <hr />
                          <EmailParameters />
                      </div>) :
                      null;

    return (
        <div className="top-panel">
            <WeboobParameters />
            { emailConfig }
        </div>
    );
};

export default connect(state => {
    return {
        standalone: get.boolSetting(state, 'standalone-mode'),
    };
})(AdminSection);
