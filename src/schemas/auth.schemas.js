const { z } = require('zod')

const registerSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid Email"),
        password: z.string().min(6, "Password minimum 6 character"),
        name: z.string().min(2, "Name minimum 2 character")
    })
})

const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid Email"),
        password: z.string().min(6, "Password minimum 6 character")
    })
})


module.exports = {
    registerSchema,
    loginSchema
}