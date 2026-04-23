const express = require("express")
const authController = require("../controllers/auth.controller")
const validate = require("../middleware/validate")
const { registerSchema, loginSchema } = require("../schemas/auth.schemas")


const router = express.Router()


/* POST /api/auth/register - with validation */
router.post("/register", validate(registerSchema), authController.userRegisterController)

/* POST /api/auth/login - with validation */
router.post("/login", validate(loginSchema), authController.userLoginController)

/**
 * - POST /api/auth/logout
 */
router.post("/logout", authController.userLogoutController)

module.exports = router