import { BankState } from './banks';
import { BudgetState } from './budgets';
import { CategoryState } from './categories';
import { SettingState } from './settings';

export type GlobalState = {
    banks: BankState;
    budgets: BudgetState;
    categories: CategoryState;
    settings: SettingState;
};

export type GetStateType = () => GlobalState;
