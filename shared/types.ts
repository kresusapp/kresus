// Subsets of types defined in server models, but that are also present in the
// client.

export interface SharedTransaction {
    debitDate: Date | null;
    date: Date;
    type: string;
}

export interface SharedBudget {
    viewId: number;
    year: number;
    month: number;
    threshold: number | null;
}

export interface SharedAlert {
    type: string;
    frequency?: string | null;
    limit?: number | null;
    order?: string | null;
}

// A user action may be required to validate a sync to a website, or answer a
// 2fa challenge, with additional form fields to fill.

export type UserActionKind = 'decoupled_validation' | 'browser_question';

export interface UserActionField {
    id: string;
    label: string;
}

export interface UserActionResponse {
    kind: 'user_action';
    actionKind: UserActionKind;
    message?: string;
    fields?: UserActionField[];
}

// Transaction rules.

export type TransactionRuleConditionType =
    | 'label_matches_text'
    | 'label_matches_regexp'
    | 'amount_equals';
export type TransactionRuleActionType = 'categorize';
