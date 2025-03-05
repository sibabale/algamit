export type BankAccountStatus = 'ACTIVE' | 'CLOSED';

export type BankAccount = {
    id: number;
    owner: string;
    status: BankAccountStatus;
    balance: number;
    accountNumber: number;
};