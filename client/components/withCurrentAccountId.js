import React from 'react';
import { useParams } from 'react-router-dom';

export default Component => {
    return props => {
        let { currentAccountId } = useParams();
        currentAccountId = Number.parseInt(currentAccountId, 10);
        return <Component currentAccountId={currentAccountId} {...props} />;
    };
};
