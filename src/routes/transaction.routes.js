const { Router } = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const transactionController = require("../controllers/transaction.controller");
const validate = require("../middleware/validate");
const {
  createTransactionSchema,
  getTransactionSchema,
  listTransactionsSchema,
} = require("../schemas/transaction.schemas");

const transactionRoutes = Router();

/**
 * - POST /api/transactions/
 * - Create a new transaction
 * - Protected: requires authenticated user
 */
transactionRoutes.post(
  "/",
  authMiddleware.authMiddleware,
  validate(createTransactionSchema),
  transactionController.createTransaction,
);

/**
 * - POST /api/transactions/system/initial-funds
 * - Create initial funds transaction from system user
 */
transactionRoutes.post(
  "/system/initial-funds",
  authMiddleware.authSystemUserMiddleware,
  transactionController.createInitialFundsTransaction,
);

module.exports = transactionRoutes;
