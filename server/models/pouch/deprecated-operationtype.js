import * as cozydb from 'cozydb';
import { promisifyModel } from '../../helpers';

// ************************************************************************
// MODEL KEPT ONLY FOR BACKWARD COMPATIBILITY, DO NOT MODIFY.
// ************************************************************************

let OperationType = cozydb.getModel('operationtype', {
    // Display name
    name: String,

    // Weboob unique id
    weboobvalue: Number
});

OperationType = promisifyModel(OperationType);

module.exports = OperationType;
