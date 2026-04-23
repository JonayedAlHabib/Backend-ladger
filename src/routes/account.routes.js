const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const accountController = require("../controllers/account.controller");
const validate = require("../middleware/validate");
const {
  createAccountSchema,
  updateAccountSchema,
  getAccountBalanceSchema,
} = require("../schemas/account.schemas");

const router = express.Router();

/**
 * - POST /api/accounts/
 * - create an account
 * - protected route
 */
router.post(
  "/",
  validate(createAccountSchema),
  accountController.createAccountController,
);

/**
 * - GET /api/accounts/
 * - Get all accounts of the logged-in user
 * - Protected Route
 */
router.get(
  "/",
  validate(getAccountBalanceSchema),
  accountController.getUserAccountsController,
);

/**
 * - GET /api/accounts/balance/:accountId
 */
router.get(
  "/balance/:accountId",
  validate(updateAccountSchema),
  accountController.getAccountBalanceController,
);

module.exports = router;
