import React from 'react';
import { Routes, Route } from 'react-router';

import CreateTransaction from './create';
import Details from './details';

export default () => {
    return (
        <Routes>
            <Route path="new" element={<CreateTransaction />} />
            <Route path=":transactionId" element={<Details />} />
        </Routes>
    );
};
