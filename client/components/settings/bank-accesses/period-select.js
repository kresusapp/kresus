import React from 'react';
import PropTypes from 'prop-types';

import { translate as $t } from '../../../helpers';

import frequencies from '../../../../shared/fetch-frequencies';

const FrequencySelect = props => {
    let options = frequencies.map(freq => (
        <option
          value={ freq.period }
          key={ freq.name }>
            { $t(`client.edit_access_modal.frequencies.${freq.name}`) }
        </option>
    ));
    return (
        <select
          className='form-control'
          value={ props.value }
          onChange={ props.onChange }>
            { options }
        </select>
    );
};

FrequencySelect.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired
};

export default FrequencySelect;
