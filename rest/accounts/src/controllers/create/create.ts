import { Request, Response } from 'express';
import accounts from '../../data/accounts.json';
import { BankAccount, BankAccountStatus } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { isValidAuthHeader } from '../../utils/index';

export const createAccount = (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: No token provided'
            });
        }

        if (!isValidAuthHeader(authHeader)) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: Invalid token'
            });
        }

        const { owner } = req.body;

        if (!owner) {
            return res.status(400).json({
                success: false,
                error: 'Please provide owner'
            });
        }

        function generateAccountNumber(): number {
            const uuid = uuidv4().replace(/-/g, '');
            return parseInt(uuid.substring(0, 10), 16);
        }

        const newAccount: BankAccount = {
            id: accounts.length > 0 ? Math.max(...accounts.map(acc => acc.id)) + 1 : 1,
            accountNumber: generateAccountNumber(),
            owner,
            balance: 0,
            status: 'ACTIVE' as BankAccountStatus
        };

        res.status(201).json({
            success: true,
            data: newAccount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
}; 