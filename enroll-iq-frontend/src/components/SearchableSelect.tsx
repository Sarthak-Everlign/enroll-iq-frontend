'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, X, Building2, Trophy } from 'lucide-react'
import { clsx } from 'clsx'

interface Option {
  value: string
  label: string
  country?: string
  rank?: number
  overall_score?: number
}

interface SearchableSelectProps {
  label: string
  name: string
  options: Option[]
  value?: string
  onChange?: (value: string) => void
  required?: boolean
  placeholder?: string
  disabled?: boolean
  error?: string
}

export default function SearchableSelect({
  label,
  name,
  options,
  value,
  onChange,
  required = false,
  placeholder = 'Search and select...',
  disabled = false,
  error,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)
  
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.country?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.('')
    setSearchTerm('')
  }

  return (
    <div className="space-y-2" ref={containerRef}>
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {/* Selected Value / Trigger */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={clsx(
            'w-full px-4 py-3 rounded-xl border-2 bg-white/80 backdrop-blur-sm transition-all duration-200 outline-none text-left flex items-center gap-3',
            error
              ? 'border-red-300 focus:border-red-500'
              : 'border-gray-200 focus:border-pink-500 hover:border-gray-300',
            disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
            isOpen && 'border-pink-500 ring-4 ring-pink-100'
          )}
        >
          <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <span className={clsx('flex-1 truncate', !selectedOption && 'text-gray-400')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption && !disabled && (
            <X 
              className="w-5 h-5 text-gray-400 hover:text-gray-600 flex-shrink-0" 
              onClick={handleClear}
            />
          )}
          <ChevronDown 
            className={clsx(
              'w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180'
            )} 
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-up">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search universities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-pink-500 outline-none transition-colors text-gray-800 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Options List */}
            <div className="search-dropdown">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No universities found</p>
                  <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={clsx(
                      'w-full px-4 py-3 text-left flex items-center gap-3 transition-colors',
                      'hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50',
                      option.value === value && 'bg-pink-50',
                      index !== filteredOptions.length - 1 && 'border-b border-gray-50'
                    )}
                    style={{ animationDelay: `${index * 20}ms` }}
                  >
                    {/* Rank Badge */}
                    {option.rank ? (
                      <div className={clsx(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold',
                        option.rank <= 10 
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' 
                          : option.rank <= 50 
                          ? 'bg-gradient-to-br from-purple-400 to-indigo-500 text-white'
                          : option.value === value 
                          ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      )}>
                        #{option.rank}
                      </div>
                    ) : (
                      <div className={clsx(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                        option.value === value 
                          ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white' 
                          : 'bg-gray-100 text-gray-500'
                      )}>
                        <Building2 className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={clsx(
                        'font-medium truncate',
                        option.value === value ? 'text-pink-700' : 'text-gray-800'
                      )}>
                        {option.label}
                      </p>
                      <div className="flex items-center gap-2">
                        {option.country && (
                          <p className="text-sm text-gray-500 truncate">{option.country}</p>
                        )}
                        {option.overall_score && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">
                            {option.overall_score} pts
                          </span>
                        )}
                      </div>
                    </div>
                    {option.rank && option.rank <= 10 && (
                      <Trophy className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

