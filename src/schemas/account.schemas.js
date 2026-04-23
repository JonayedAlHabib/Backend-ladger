const {z } = require('zod')


const createAccountSchema = z.object({
  body: z.object({
    user: z
      .string()
      .refine((val) => {
        return /^[0-9a-fA-F]{24}$/.test(val);
      }, "User ID must be a valid MongoDB ID"),
    
    status: z
      .enum(["ACTIVE", "FROZEN", "CLOSED"])
      .optional()
      .default("ACTIVE"),
    
    currency: z
      .enum(["BDT", "USD", "EUR", "GBP", "JPY"])
      .optional()
      .default("BDT"),
  }),
});

// Schema for updating account status
const updateAccountSchema = z.object({
  body: z.object({
    status: z
      .enum(["ACTIVE", "FROZEN", "CLOSED"])
      .optional(),
    
    currency: z
      .enum(["BDT", "USD", "EUR", "GBP", "JPY"])
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be updated"
  ),
});

// Schema for getting account balance - requires account ID in params
const getAccountBalanceSchema = z.object({
  params: z.object({
    accountId: z
      .string()
      .refine((val) => {
        return /^[0-9a-fA-F]{24}$/.test(val);
      }, "Invalid account ID format"),
  }),
});

module.exports = {
  createAccountSchema,
  updateAccountSchema,
  getAccountBalanceSchema,
};