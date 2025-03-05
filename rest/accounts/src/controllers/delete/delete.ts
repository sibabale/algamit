import { Request, Response } from 'express';
import accounts from '../../data/accounts.json';
import { isValidAuthHeader } from '../../utils'; 
import { BankAccountStatus } from '../../types';

export const closeAccount = (req: Request, res: Response) => {
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

        const id = parseInt(req.params.id);
        const accountIndex = accounts.findIndex(acc => acc.id === id);

        if (accountIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Account not found'
            });
        }

        accounts[accountIndex].status = 'CLOSED' as BankAccountStatus;

        res.status(200).json({
            success: true,
            message: 'Account closed successfully',
            data: accounts[accountIndex]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};
