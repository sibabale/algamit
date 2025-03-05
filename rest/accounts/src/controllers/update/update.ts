import { Request, Response } from 'express';
import accounts from '../../data/accounts.json';
import { isValidAuthHeader } from '../../utils'; 

export const updateAccountOwner = (req: Request, res: Response) => {
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
        const { owner } = req.body;

        if (!owner) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a new owner name'
            });
        }

        const accountIndex = accounts.findIndex(acc => acc.id === id);

        if (accountIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Account not found'
            });
        }

        if (accounts[accountIndex].owner === owner) {
            return res.status(400).json({
                success: false,
                error: 'The new owner name must be different from the current owner name'
            });
        }

        accounts[accountIndex].owner = owner;

        res.status(200).json({
            success: true,
            message: 'Account owner updated successfully',
            data: accounts[accountIndex]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};
