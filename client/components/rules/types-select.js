import React from 'react';

import OperationTypes from '../../../shared/operation-types.json';
import SelectWithDefault from '../ui/select-with-default.js';

import { translate as $t } from '../../helpers';

export default class TypesSelect extends SelectWithDefault {
    constructor(props) {
        let options = OperationTypes.map(type =>
            <option key={ type.name } value={ type.name }>
                { $t(`client.${type.name}`) }
            </option>
        );
        super(props, options);
    }
}
