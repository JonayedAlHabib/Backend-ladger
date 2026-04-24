const express = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const accountController = require("../controllers/account.controller");
const validate = require("../middleware/validate");
const {
    createAccountSchema,
    getAccountBalanceSchema,
} = require("../schemas/account.schemas");

const router = express.Router();

// All account routes require auth
router.use(authMiddleware);

/**
 * POST /api/accounts/
 * Create an account for the logged-in user
 */
router.post(
    "/",
    validate(createAccountSchema),
    accountController.createAccountController
);

/**
 * GET /api/accounts/
 * Get all accounts of the logged-in user
 */
router.get(
    "/",
    accountController.getUserAccountsController
);

/**
 * GET /api/accounts/balance/:accountId
 */
router.get(
    "/balance/:accountId",
    validate(getAccountBalanceSchema),
    accountController.getAccountBalanceController
);

module.exports = router;