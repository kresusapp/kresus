import { BankState } from './banks';
import { BudgetState } from './budgets';
import { CategoryState } from './categories';
import { InstanceState } from './instance';
import { SettingState } from './settings';
import { UiState } from './ui';

export type GlobalState = {
    banks: BankState;
    budgets: BudgetState;
    categories: CategoryState;
    settings: SettingState;
    instance: InstanceState;
    ui: UiState;
};

export type GetStateType = () => GlobalState;
