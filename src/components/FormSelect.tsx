'use client'

import { ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'

interface FormSelectProps {
  label: string
  name: string
  options: { value: string; label: string }[]
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  required?: boolean
  placeholder?: string
  disabled?: boolean
  error?: string
}

export default function FormSelect({
  label,
  name,
  options,
  value,
  onChange,
  required = false,
  placeholder = 'Select an option',
  disabled = false,
  error,
}: FormSelectProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={clsx(
            'w-full px-4 py-3 rounded-xl border-2 bg-white/80 backdrop-blur-sm transition-all duration-200 outline-none input-glow appearance-none cursor-pointer',
            'text-gray-800',
            error
              ? 'border-red-300 focus:border-red-500'
              : 'border-gray-200 focus:border-pink-500 hover:border-gray-300',
            disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
            !value && 'text-gray-400'
          )}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}

