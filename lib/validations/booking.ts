import * as z from 'zod'

const nameField = z
  .string()
  .trim()
  .min(1, { error: 'This field is required.' })
  .regex(/^[A-Za-z][A-Za-z '-]*$/, { error: 'Use half-width alphabetical characters.' })

const requiredText = z.string().trim().min(1, { error: 'This field is required.' })
const requiredDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Enter a valid date.' })

export const passengerSchema = z.object({
  firstName: nameField,
  lastName: nameField,
  middleName: z
    .string()
    .trim()
    .regex(/^[A-Za-z '-]*$/, { error: 'Use half-width alphabetical characters.' })
    .optional(),
  contactEmail: z.email({ error: 'Enter a valid email address.' }).trim(),
  contactPhone: z.string().trim().optional(),
  dateOfBirth: requiredDate,
  nationality: requiredText,
  passportNumber: requiredText,
  countryOfIssue: requiredText,
  dateOfIssue: requiredDate,
  dateOfExpiry: requiredDate,
})

export type PassengerInput = z.infer<typeof passengerSchema>

export type BookingFormState =
  | {
      errors?: Partial<Record<keyof PassengerInput, string[]>>
      message?: string
    }
  | undefined
