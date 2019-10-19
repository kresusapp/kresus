import { makeLogger } from '../helpers';
import BankVendors from '../shared/banks.json';

let log = makeLogger('lib/bank-vendors');

export function bankVendorByUuid(uuid) {
    if (typeof uuid !== 'string') {
        log.warn('Bank.byUuid misuse: uuid must be a String');
    }
    return BankVendors.find(vendor => vendor.uuid === uuid);
}
