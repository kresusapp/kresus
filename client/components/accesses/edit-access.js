import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import URL from '../../urls';

import EditAccessForm from './edit-access-form';

export default props => {
    let { accessId } = props;
    let history = useHistory();
    const handleSubmitSuccess = useCallback(() => {
        history.push(URL.accesses.url());
    }, [history]);

    return <EditAccessForm accessId={accessId} onSubmitSuccess={handleSubmitSuccess} />;
};
