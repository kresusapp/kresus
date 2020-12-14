import { BankState } from './banks';
import { BudgetState } from './budgets';
import { CategoryState } from './categories';

export type GlobalState = {
    banks: BankState;
    budgets: BudgetState;
    categories: CategoryState;
};

export type GetStateType = () => GlobalState;
