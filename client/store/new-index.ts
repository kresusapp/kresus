import { BankState } from './banks';
import { BudgetState } from './budgets';
import { CategoryState } from './categories';
import { InstanceState } from './instance';
import { SettingState } from './settings';

export type GlobalState = {
    banks: BankState;
    budgets: BudgetState;
    categories: CategoryState;
    settings: SettingState;
    instance: InstanceState;
};

export type GetStateType = () => GlobalState;
