export type BankCurrency = 'USD' | 'EUR' | 'GBP' | 'ZAR'
export type BankTransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER'
export type BankTransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED'

export type BankTransaction = {
    id: number
    type: BankTransactionType
    status: BankTransactionStatus
    amount: number
    accountId: number
    accountBalance: number
    accountCurrency: string
    destination: {
        ownerId: number
        accountNumber: number
    }
}

export type NewTransaction = {
    id: string
    type: BankTransactionType
    amount: number
    accountNumber: number
    accountCurrency: BankCurrency
    destination: {
        accountNumber: number
    }
}
