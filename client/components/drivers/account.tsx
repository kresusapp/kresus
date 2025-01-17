import * as ViewStore from '../../store/views';

import { assert } from '../../helpers';

import { Driver, DriverConfig, DriverType } from './base';

export class DriverAccount extends Driver {
    config: DriverConfig = {
        showAddTransaction: true,
        showDuplicates: true,
        showBudget: true,
        showRecurringTransactions: true,
    };

    currentViewId: number | null;

    constructor(viewId: number | null) {
        super(DriverType.Account, viewId !== null ? viewId.toString() : viewId);
        this.currentViewId = viewId;
    }

    getView(state: ViewStore.ViewState) {
        assert(this.currentViewId !== null, 'view id must be defined');
        return ViewStore.fromId(state, this.currentViewId);
    }
}
