"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccount = void 0;
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const index_1 = require("../../utils/index");
const prisma = new client_1.PrismaClient();
const createAccount = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: No token provided',
            });
        }
        if (!(0, index_1.isValidAuthHeader)(authHeader)) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: Invalid token',
            });
        }
        const { ownerId, accountType = 'SAVINGS' } = req.body;
        if (!ownerId || !(0, uuid_1.validate)(ownerId)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid owner ID (UUID format)',
            });
        }
        const existingAccount = await prisma.account.findFirst({
            where: {
                ownerId,
                accountType,
                status: 'ACTIVE',
            },
        });
        if (existingAccount) {
            return res.status(400).json({
                success: false,
                error: `User already has an active ${accountType} account`,
            });
        }
        const newAccount = await prisma.account.create({
            data: {
                ownerId,
                accountType: accountType,
            },
        });
        res.status(201).json({
            success: true,
            data: newAccount,
        });
    }
    catch (error) {
        console.error('Create account error:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.createAccount = createAccount;
