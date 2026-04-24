const accountModel = require("../models/account.model");

async function createAccountController(req, res) {
    const user = req.user;
    const { currency } = req.body;

    const account = await accountModel.create({
        user: user._id,
        currency: currency || "BDT"
    });

    res.status(201).json({
        success: true,
        account
    });
}

async function getUserAccountsController(req, res) {
    const accounts = await accountModel.find({ user: req.user._id });

    res.status(200).json({
        success: true,
        accounts
    });
}

async function getAccountBalanceController(req, res) {
    const { accountId } = req.params;

    const account = await accountModel.findOne({
        _id: accountId,
        user: req.user._id
    });

    if (!account) {
        return res.status(404).json({
            success: false,
            message: "Account not found"
        });
    }

    const balance = await account.getBalance();

    res.status(200).json({
        success: true,
        accountId: account._id,
        balance: balance,
        currency: account.currency
    });
}

module.exports = {
    createAccountController,
    getUserAccountsController,
    getAccountBalanceController
};