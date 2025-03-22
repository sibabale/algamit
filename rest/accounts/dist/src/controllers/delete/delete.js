"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeAccount = void 0;
const utils_1 = require("../../utils");
const client_1 = require("@prisma/client");
const closeAccount = async (req, res) => {
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
        const account = await prisma.account.findUnique({
            where: { accountNumber },
        });
        if (!account) {
            return res.status(404).json({
                success: false,
                error: 'Account not found',
            });
        }
        account.status = 'CLOSED';
        await prisma.account.update({
            where: { accountNumber },
            data: account,
        });
        res.status(200).json({
            success: true,
            message: 'Account closed successfully',
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
exports.closeAccount = closeAccount;
