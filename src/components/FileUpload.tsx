'use client'

import { useState, useRef } from 'react'
import { Upload, File, X, Check, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'

interface FileUploadProps {
  label: string
  name: string
  accept?: string
  required?: boolean
  description?: string
  maxSizeMB?: number
  onFileChange?: (file: File | null) => void
}

export default function FileUpload({
  label,
  name,
  accept = '.pdf,.jpg,.jpeg,.png',
  required = false,
  description,
  maxSizeMB = 5,
  onFileChange,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploaded, setIsUploaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (selectedFile: File | null) => {
    setError(null)
    
    if (!selectedFile) {
      setFile(null)
      setIsUploaded(false)
      onFileChange?.(null)
      return
    }

    // Check file size
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`)
      return
    }

    setFile(selectedFile)
    setIsUploaded(true)
    onFileChange?.(selectedFile)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleRemove = () => {
    setFile(null)
    setIsUploaded(false)
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    onFileChange?.(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {!isUploaded ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={clsx(
            'upload-zone rounded-2xl p-6 cursor-pointer transition-all duration-300',
            isDragOver && 'dragover scale-[1.02]'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            name={name}
            accept={accept}
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-3 text-center">
            <div className={clsx(
              'w-14 h-14 rounded-2xl flex items-center justify-center transition-colors',
              isDragOver 
                ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white' 
                : 'bg-gray-100 text-gray-400'
            )}>
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="text-gray-700 font-medium">
                <span className="text-pink-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {description || `PDF, JPG, PNG (max ${maxSizeMB}MB)`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-green-200 bg-green-50/50 p-4 animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white shadow-lg">
              <File className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{file?.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Uploaded successfully</span>
                <span className="text-sm text-gray-400">• {file && formatFileSize(file.size)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 rounded-xl hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  )
}

