import { isValidPhoneNumber } from 'libphonenumber-js'
import * as z from 'zod'

const nameField = z
  .string()
  .trim()
  .min(1, { error: 'This field is required.' })
  .regex(/^[A-Za-z][A-Za-z '-]*$/, { error: 'Use half-width alphabetical characters.' })

const requiredText = z.string().trim().min(1, { error: 'This field is required.' })
const passportField = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9]{6,9}$/, { error: 'Enter a valid passport number (6-9 letters or digits).' })
const datePattern = /^\d{4}-\d{2}-\d{2}$/
const requiredDate = z.string().trim().regex(datePattern, { error: 'Enter a valid date.' })

const todayKey = () => new Date().toISOString().slice(0, 10)

export const passengerSchema = z
  .object({
  firstName: nameField,
  lastName: nameField,
  middleName: z
    .string()
    .trim()
    .regex(/^[A-Za-z '-]*$/, { error: 'Use half-width alphabetical characters.' })
    .optional(),
  contactEmail: z.email({ error: 'Enter a valid email address.' }).trim(),
  contactPhone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || isValidPhoneNumber(value), {
      error: 'Enter a valid phone number.',
    }),
  dateOfBirth: requiredDate,
  nationality: requiredText,
  passportNumber: passportField,
  countryOfIssue: requiredText,
  dateOfIssue: requiredDate,
  dateOfExpiry: requiredDate,
  })
  .superRefine((data, ctx) => {
    const today = todayKey()
    if (datePattern.test(data.dateOfBirth) && data.dateOfBirth >= today) {
      ctx.addIssue({
        code: 'custom',
        path: ['dateOfBirth'],
        message: 'Date of birth must be in the past.',
      })
    }
    if (datePattern.test(data.dateOfIssue) && data.dateOfIssue > today) {
      ctx.addIssue({
        code: 'custom',
        path: ['dateOfIssue'],
        message: 'Date of issue cannot be in the future.',
      })
    }
    if (datePattern.test(data.dateOfIssue) && datePattern.test(data.dateOfExpiry)) {
      if (data.dateOfExpiry <= data.dateOfIssue) {
        ctx.addIssue({
          code: 'custom',
          path: ['dateOfExpiry'],
          message: 'Date of expiry must be after the date of issue.',
        })
      } else if (data.dateOfExpiry <= today) {
        ctx.addIssue({
          code: 'custom',
          path: ['dateOfExpiry'],
          message: 'Passport has expired.',
        })
      }
    }
  })

export type PassengerInput = z.infer<typeof passengerSchema>

export type BookingFormState =
  | {
      errors?: Partial<Record<keyof PassengerInput, string[]>>
      message?: string
    }
  | undefined
