const { z } = require('zod');

const isValidMongoId = (val) => /^[0-9a-fA-F]{24}$/.test(val);

const createTransactionSchema = z.object({
  body: z.object({
    // Account sending money FROM
    fromAccount: z
      .string()
      .refine(isValidMongoId, "Invalid fromAccount ID format"),
    
    // Account receiving money TO
    toAccount: z
      .string()
      .refine(isValidMongoId, "Invalid toAccount ID format"),
    
    // Transaction amount - must be positive number
    amount: z
      .number()
      .positive("Amount must be greater than 0")
      .max(1000000, "Amount cannot exceed 1,000,000"),
    
    // Description (optional)
    description: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),
    
    // Idempotency key - prevents duplicate transactions
    // Must be unique identifier for this transaction
    idempotencyKey: z
      .string()
      .min(1, "Idempotency key is required")
      .max(255, "Idempotency key cannot exceed 255 characters"),
  })
  // Additional validation: fromAccount and toAccount must be different
  .refine(
    (data) => data.fromAccount !== data.toAccount,
    {
      message: "Cannot transfer money to the same account",
      path: ["toAccount"], // Error will be associated with this field
    }
  ),
});

// Schema for getting transaction status - requires transaction ID in params
const getTransactionSchema = z.object({
  params: z.object({
    transactionId: z
      .string()
      .refine(isValidMongoId, "Invalid transaction ID format"),
  }),
});

// Schema for filtering transactions with query parameters
const listTransactionsSchema = z.object({
  query: z.object({
    // Account ID to filter by
    account: z
      .string()
      .refine(isValidMongoId, "Invalid account ID format")
      .optional(),
    
    // Filter by status
    status: z
      .enum(["PENDING", "COMPLETED", "FAILED", "REVERSED"])
      .optional(),
    
    // Pagination: page number
    page: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0, "Page must be greater than 0")
      .optional()
      .default("1"),
    
    // Pagination: items per page
    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100")
      .optional()
      .default("10"),
  }),
});

module.exports = {
  createTransactionSchema,
  getTransactionSchema,
  listTransactionsSchema,
};