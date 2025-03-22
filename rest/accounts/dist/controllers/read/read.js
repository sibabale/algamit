"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountById = exports.getAllAccounts = void 0;
const utils_1 = require("../../utils");
const client_1 = require("@prisma/client");
// Get all accounts
const getAllAccounts = async (req, res) => {
    try {
        const prisma = new client_1.PrismaClient();
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
        const accounts = await prisma.account.findMany();
        res.status(200).json({
            success: true,
            data: accounts,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
};
exports.getAllAccounts = getAllAccounts;
// Get single account by ID
const getAccountById = async (req, res) => {
    try {
        const prisma = new client_1.PrismaClient();
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
        const accounts = await prisma.account.findMany();
        const accountNumber = req.params.accountNumber;
        const account = accounts.find((acc) => acc.accountNumber === accountNumber);
        if (!account) {
            return res.status(404).json({
                success: false,
                error: 'Account not found',
            });
        }
        res.status(200).json({
            success: true,
            data: account,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
};
exports.getAccountById = getAccountById;
