import React from 'react';
import { useParams } from 'react-router-dom';

export default Component => {
    return props => {
        let { currentAccountId } = useParams();
        return <Component currentAccountId={currentAccountId} {...props} />;
    };
};
