import { assert } from '../../helpers';

import * as ViewStore from '../../store/views';
import { Driver, DriverConfig, DriverType } from './base';

export class DriverCurrency extends Driver {
    config: DriverConfig = {
        showDuplicates: false,
        showBudget: false,
        showRecurringTransactions: false,
    };

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
