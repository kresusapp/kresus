import React from 'react';
import PropTypes from 'prop-types';

import { translate as $t } from '../../helpers';

const SupportComponents = props => {
    return <div />;
};

SupportComponents.propTypes = {
    // The history object, providing access to the history API.
    // Automatically added by the Route component.
    history: PropTypes.object.isRequired,

    // Location object (contains the current path). Automatically added by react-router.
    location: PropTypes.object.isRequired
};

export default SupportComponents;
