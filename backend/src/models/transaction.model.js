const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "fromAccount is required"],
        index: true
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "toAccount is required"],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
            message: "Invalid status"
        },
        default: "PENDING",
        index: true
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        min: [0, "Amount cannot be negative"]
    },
    description: {
        type: String,
        maxlength: 500,
        trim: true
    },
    idempotencyKey: {
        type: String,
        required: [true, "Idempotency key required"],
        unique: true,
        index: true
    }
}, {
    timestamps: true
})

transactionSchema.index({ fromAccount: 1, createdAt: -1 })
transactionSchema.index({ toAccount: 1, createdAt: -1 })

const transactionModel = mongoose.model("transaction", transactionSchema)

module.exports = transactionModel