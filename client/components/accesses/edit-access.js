import React, { useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import URL from './urls';

import EditAccessForm from './edit-access-form';

export default () => {
    let history = useHistory();
    let { accessId: accessIdStr } = useParams();

    let accessId = Number.parseInt(accessIdStr, 10);

    const handleSubmitSuccess = useCallback(() => {
        history.push(URL.list);
    }, [history]);

    return <EditAccessForm accessId={accessId} onSubmitSuccess={handleSubmitSuccess} />;
};
