import type { UseFormRegisterReturn } from 'react-hook-form'

const inputClass =
  'rounded border border-gray-300 px-3 py-2 focus:border-brand-600 focus:outline-none'
const labelClass = 'text-sm font-medium text-gray-800'

export function TextField({
  label,
  hint,
  required,
  type = 'text',
  registration,
  error,
}: {
  label: string
  hint?: string
  required?: boolean
  type?: string
  registration: UseFormRegisterReturn
  error?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={registration.name} className={labelClass}>
        {label} {required && <span className="text-red-600">*</span>}
        {hint && <span className="ml-1 font-normal text-gray-400">{hint}</span>}
      </label>
      <input id={registration.name} type={type} className={inputClass} {...registration} />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
