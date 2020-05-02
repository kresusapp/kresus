// Subsets of types defined in server models, but that are also present in the
// client.

export interface SharedTransaction {
    debitDate: Date | null;
    date: Date;
    type: string;
}

export interface SharedBudget {
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
