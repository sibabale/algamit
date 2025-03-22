"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRateLimiter = void 0;
exports.isValidAuthHeader = isValidAuthHeader;
const express_rate_limit_1 = require("express-rate-limit");
exports.apiRateLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 1000, // 1 second
    max: 2, // limit each IP to 2 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests, please try again later.'
    }
});
function isValidAuthHeader(authHeader) {
    const expectedToken = "Bearer ba_123456789";
    return authHeader === expectedToken;
}
