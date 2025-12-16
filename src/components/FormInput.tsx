'use client'

import { clsx } from 'clsx'

interface FormInputProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  disabled?: boolean
  error?: string
}

export default function FormInput({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={clsx(
          'w-full px-4 py-3 rounded-xl border-2 bg-white/80 backdrop-blur-sm transition-all duration-200 outline-none input-glow',
          'placeholder:text-gray-400 text-gray-800',
          error
            ? 'border-red-300 focus:border-red-500'
            : 'border-gray-200 focus:border-pink-500 hover:border-gray-300',
          disabled && 'bg-gray-100 cursor-not-allowed opacity-60'
        )}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}

