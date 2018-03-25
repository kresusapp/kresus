'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.checkAlert = checkAlert;
function checkAlert(alert) {
    if (alert.type === 'report') {
        if (typeof alert.frequency !== 'string' || !['daily', 'weekly', 'monthly'].includes(alert.frequency)) {
            return 'invalid report parameters';
        }
    } else if (alert.type === 'balance' || alert.type === 'transaction') {
        if (typeof alert.limit !== 'number' || Number.isNaN(alert.limit) || typeof alert.order !== 'string' || !['gt', 'lt'].includes(alert.order)) {
            return 'invalid balance/transaction parameters';
        }
    } else {
        return 'invalid alert type';
    }
    return null;
}