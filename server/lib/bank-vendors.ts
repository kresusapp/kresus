import { unwrap } from '../helpers';
import BankVendors from '../shared/banks.json';

export function bankVendorByUuid(uuid: string) {
    return unwrap(BankVendors.find(vendor => vendor.uuid === uuid));
}
