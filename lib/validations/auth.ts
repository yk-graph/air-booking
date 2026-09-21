import * as z from 'zod'

export const registerSchema = z.object({
  email: z.email({ error: 'Enter a valid email address.' }).trim(),
  password: z
    .string()
    .min(8, { error: 'Password must be at least 8 characters long.' })
    .regex(/[a-zA-Z]/, { error: 'Password must contain at least one letter.' })
    .regex(/[0-9]/, { error: 'Password must contain at least one number.' }),
})

export const loginSchema = z.object({
  email: z.email({ error: 'Enter a valid email address.' }).trim(),
  password: z.string().min(1, { error: 'Enter your password.' }),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>

export type AuthFormState =
  | {
      errors?: {
        email?: string[]
        password?: string[]
      }
      message?: string
    }
  | undefined
