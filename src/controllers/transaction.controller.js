const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model")
const emailService = require("../services/email.service")
const mongoose = require("mongoose")

/**
 * POST /api/transactions/
 * Transfer money between accounts
 * 
 * Flow:
 *   1. Validate request
 *   2. Validate accounts exist + ownership
 *   3. Check idempotency
 *   4. Check account status
 *   5. Within session:
 *        - Re-check balance (race-safe)
 *        - Create transaction (PENDING)
 *        - Create DEBIT + CREDIT entries
 *        - Mark COMPLETED
 *        - Commit
 *   6. Fire-and-forget email
 */
async function createTransaction(req, res) {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body

    // 1. Ownership check — fromAccount MUST belong to current user
    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
        user: req.user._id
    })

    if (!fromUserAccount) {
        return res.status(403).json({
            success: false,
            message: "You do not own the fromAccount"
        })
    }

    const toUserAccount = await accountModel.findOne({ _id: toAccount })

    if (!toUserAccount) {
        return res.status(400).json({
            success: false,
            message: "Invalid toAccount"
        })
    }

    // 2. Idempotency check
    const existingTx = await transactionModel.findOne({ idempotencyKey })

    if (existingTx) {
        if (existingTx.status === "COMPLETED") {
            return res.status(200).json({
                success: true,
                message: "Transaction already processed",
                transaction: existingTx
            })
        }
        if (existingTx.status === "PENDING") {
            return res.status(409).json({
                success: false,
                message: "Transaction is still processing"
            })
        }
        if (existingTx.status === "FAILED" || existingTx.status === "REVERSED") {
            return res.status(409).json({
                success: false,
                message: `Previous transaction ${existingTx.status.toLowerCase()}, use a new idempotency key`
            })
        }
    }

    // 3. Account status check
    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            success: false,
            message: "Both accounts must be ACTIVE"
        })
    }

    // 4. ACID session
    const session = await mongoose.startSession()
    let transaction

    try {
        session.startTransaction()

        // Race-safe balance check INSIDE session
        const balance = await fromUserAccount.getBalance(session)

        if (balance < amount) {
            await session.abortTransaction()
            return res.status(400).json({
                success: false,
                message: `Insufficient balance. Current: ${balance}, Requested: ${amount}`
            })
        }

        // Create transaction
        transaction = (await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session }))[0]

        // Double-entry: DEBIT + CREDIT
        await ledgerModel.create([{
            account: fromAccount,
            amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session })

        await ledgerModel.create([{
            account: toAccount,
            amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session })

        // Mark complete
        await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session }
        )

        await session.commitTransaction()
    } catch (error) {
        await session.abortTransaction()
        console.error("Transaction error:", error)
        return res.status(500).json({
            success: false,
            message: "Transaction failed, please retry"
        })
    } finally {
        session.endSession()
    }

    // Fire-and-forget email
    emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)
        .catch(err => console.error("Email failed:", err))

    return res.status(201).json({
        success: true,
        message: "Transaction completed successfully",
        transaction
    })
}

/**
 * POST /api/transactions/system/initial-funds
 * System-only: seed funds into a user account
 */
async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body

    const toUserAccount = await accountModel.findOne({ _id: toAccount })
    if (!toUserAccount) {
        return res.status(400).json({
            success: false,
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({ user: req.user._id })
    if (!fromUserAccount) {
        return res.status(400).json({
            success: false,
            message: "System user account not found"
        })
    }

    const existingTx = await transactionModel.findOne({ idempotencyKey })
    if (existingTx) {
        return res.status(200).json({
            success: true,
            message: "Already processed",
            transaction: existingTx
        })
    }

    const session = await mongoose.startSession()

    try {
        session.startTransaction()

        const transaction = (await transactionModel.create([{
            fromAccount: fromUserAccount._id,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session }))[0]

        await ledgerModel.create([{
            account: fromUserAccount._id,
            amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session })

        await ledgerModel.create([{
            account: toAccount,
            amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session })

        await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session }
        )

        await session.commitTransaction()

        return res.status(201).json({
            success: true,
            message: "Initial funds credited",
            transaction
        })
    } catch (error) {
        await session.abortTransaction()
        console.error("Initial funds error:", error)
        return res.status(500).json({
            success: false,
            message: "Operation failed"
        })
    } finally {
        session.endSession()
    }
}

module.exports = {
    createTransaction,
    createInitialFundsTransaction
}