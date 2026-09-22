import * as z from 'zod'

const passwordField = z
  .string()
  .min(8, { error: 'Password must be at least 8 characters long.' })
  .regex(/[a-zA-Z]/, { error: 'Password must contain at least one letter.' })
  .regex(/[0-9]/, { error: 'Password must contain at least one number.' })

export const registerSchema = z.object({
  email: z.email({ error: 'Enter a valid email address.' }).trim(),
  password: passwordField,
})

export const loginSchema = z.object({
  email: z.email({ error: 'Enter a valid email address.' }).trim(),
  password: z.string().min(1, { error: 'Enter your password.' }),
})

export const forgotPasswordSchema = z.object({
  email: z.email({ error: 'Enter a valid email address.' }).trim(),
})

export const resetPasswordSchema = z.object({
  password: passwordField,
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export type AuthFormState =
  | {
      errors?: {
        email?: string[]
        password?: string[]
      }
      message?: string
    }
  | undefined
