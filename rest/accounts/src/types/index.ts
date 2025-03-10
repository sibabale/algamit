export type AccountType = 'SAVINGS' | 'CURRENT' | 'FIXED_DEPOSIT'
export type BankAccountStatus = 'ACTIVE' | 'FROZEN' | 'CLOSED' | 'INACTIVE'

export type NewAccount = {
    ownerId: string
    accountType: AccountType
}

export type BankAccount = {
    id: number
    owner: string
    status: BankAccountStatus
    balance: number
    accountNumber: number
}
