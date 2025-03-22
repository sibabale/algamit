"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAccountOwner = void 0;
const client_1 = require("@prisma/client");
const utils_1 = require("../../utils");
const updateAccountOwner = async (req, res) => {
    const prisma = new client_1.PrismaClient();
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: No token provided',
            });
        }
        if (!(0, utils_1.isValidAuthHeader)(authHeader)) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: Invalid token',
            });
        }
        const accountNumber = req.params.accountNumber;
        const { newOwnerId } = req.body;
        if (!newOwnerId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a new owner name',
            });
        }
        const account = await prisma.account.findUnique({
            where: { accountNumber },
        });
        if (!account) {
            return res.status(404).json({
                success: false,
                error: 'Account not found',
            });
        }
        console.log(account);
        console.log(newOwnerId);
        if (account.ownerId === newOwnerId) {
            return res.status(400).json({
                success: false,
                error: 'The new owner name must be different from the current owner name',
            });
        }
        account.ownerId = newOwnerId;
        await prisma.account.update({
            where: { accountNumber },
            data: account,
        });
        res.status(200).json({
            success: true,
            message: 'Account owner updated successfully',
            data: account,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.updateAccountOwner = updateAccountOwner;
