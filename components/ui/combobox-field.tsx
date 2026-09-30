import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'

import { Combobox, type ComboboxItem } from './combobox'

const labelClass = 'text-sm font-medium text-gray-800'

export function ComboboxField<T extends FieldValues>({
  label,
  name,
  control,
  items,
  error,
  required = true,
}: {
  label: string
  name: Path<T>
  control: Control<T>
  items: ComboboxItem[]
  error?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelClass}>
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Combobox value={String(field.value ?? '')} onChange={field.onChange} items={items} />
        )}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
