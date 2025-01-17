import { assert } from '../../helpers';

import * as ViewStore from '../../store/views';
import { Driver, DriverType } from './base';

export class DriverCurrency extends Driver {
    currentCurrency: string;

    constructor(driverCurrency: string) {
        super(DriverType.Currency, driverCurrency);
        this.currentCurrency = driverCurrency;
    }

    getView(state: ViewStore.ViewState) {
        assert(this.currentCurrency !== null, 'currency must be defined');
        return ViewStore.fromCurrencyCode(state, this.currentCurrency);
    }
}
