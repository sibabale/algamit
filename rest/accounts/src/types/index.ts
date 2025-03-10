export type AccountType = 'SAVINGS' | 'CURRENT' | 'FIXED_DEPOSIT'
export type BankAccountStatus = 'ACTIVE' | 'FROZEN' | 'CLOSED' | 'INACTIVE'

export type NewAccount = {
    ownerId: string
    accountType: AccountType
}

export type BankAccount = {
    id: string
    status: BankAccountStatus
    balance: number
    ownerId: string
    updatedAt: Date
    createdAt: Date
    dateOpened: Date
    accountType: AccountType
    accountNumber: string
}
