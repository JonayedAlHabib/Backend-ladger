const { Router } = require("express");
const { authMiddleware, authSystemUserMiddleware } = require("../middleware/auth.middleware");
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
  authMiddleware,
  validate(createTransactionSchema),
  transactionController.createTransaction,
);

/**
 * - POST /api/transactions/system/initial-funds
 * - Create initial funds transaction from system user
 */
transactionRoutes.post(
  "/system/initial-funds",
  authSystemUserMiddleware,
  transactionController.createInitialFundsTransaction,
);

/**
 * - POST /api/transactions/:transactionId/accept
 * - Accept/Complete a PENDING transaction
 * - System user only
 */
transactionRoutes.post(
  "/:transactionId/accept",
  authSystemUserMiddleware,
  transactionController.acceptPendingTransaction,
);

/**
 * - GET /api/transactions/
 * - Get all transactions
 * - System user only
 */
transactionRoutes.get(
  "/",
  authSystemUserMiddleware,
  transactionController.getAllTransactions,
);

/**
 * - GET /api/transactions/:transactionId
 * - Get transaction by ID
 * - Protected: requires authenticated user
 */
transactionRoutes.get(
  "/:transactionId",
  authMiddleware,
  transactionController.getTransactionById,
);

module.exports = transactionRoutes;
