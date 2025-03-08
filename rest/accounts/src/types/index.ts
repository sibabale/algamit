import { AccountType } from '@prisma/client'

export type BankAccountStatus = 'ACTIVE' | 'CLOSED'

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
