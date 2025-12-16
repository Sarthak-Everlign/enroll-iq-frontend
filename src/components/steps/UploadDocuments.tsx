'use client'

import { useState } from 'react'
import DocumentUploadCard from '@/components/DocumentUploadCard'
import { ArrowLeft, ArrowRight, FileText, Shield, AlertTriangle, Receipt, GraduationCap } from 'lucide-react'
import { verifyForm16, verifyCasteCertificate, verifyMarksheet, type VerificationResponse } from '@/lib/api'

interface UploadDocumentsProps {
  onNext: () => void
  onBack: () => void
  data: DocumentsFormData
  onDataChange: (data: DocumentsFormData) => void
  personalData: {
    fullName: string
  }
}

export interface DocumentsFormData {
  form16: File | null
  form16Verified: boolean
  form16Eligible: boolean | null
  form16Data: Record<string, unknown> | null
  casteCertificate: File | null
  casteVerified: boolean
  casteEligible: boolean | null
  casteData: Record<string, unknown> | null
  marksheet10th: File | null
  marksheet10thVerified: boolean
  marksheet10thEligible: boolean | null
  marksheet10thData: Record<string, unknown> | null
  marksheet12th: File | null
  marksheet12thVerified: boolean
  marksheet12thEligible: boolean | null
  marksheet12thData: Record<string, unknown> | null
  graduationMarksheet: File | null
  graduationVerified: boolean
  graduationEligible: boolean | null
  graduationData: Record<string, unknown> | null
}

export default function UploadDocuments({ onNext, onBack, data, onDataChange, personalData }: UploadDocumentsProps) {
  const [errors, setErrors] = useState<string[]>([])

  // Parse name for caste verification
  const nameParts = personalData.fullName.trim().split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || nameParts[0] || ''

  const handleForm16Upload = async (file: File): Promise<VerificationResponse> => {
    onDataChange({ 
      ...data, 
      form16: file, 
      form16Verified: false, 
      form16Eligible: null,
      form16Data: null
    })
    
    const result = await verifyForm16(file)
    
    onDataChange({
      ...data,
      form16: file,
      form16Verified: result.success,
      form16Eligible: result.is_eligible ?? null,
      form16Data: result.data ?? null
    })
    
    return result
  }

  const handleCasteUpload = async (file: File): Promise<VerificationResponse> => {
    onDataChange({ 
      ...data, 
      casteCertificate: file, 
      casteVerified: false, 
      casteEligible: null,
      casteData: null
    })
    
    const result = await verifyCasteCertificate(file, firstName, lastName)
    
    onDataChange({
      ...data,
      casteCertificate: file,
      casteVerified: result.success,
      casteEligible: result.is_eligible ?? null,
      casteData: result.data ?? null
    })
    
    return result
  }

  const handleMarksheet10thUpload = async (file: File): Promise<VerificationResponse> => {
    onDataChange({ 
      ...data, 
      marksheet10th: file, 
      marksheet10thVerified: false, 
      marksheet10thEligible: null,
      marksheet10thData: null
    })
    
    const result = await verifyMarksheet(file, '10th', firstName, lastName)
    
    onDataChange({
      ...data,
      marksheet10th: file,
      marksheet10thVerified: result.success,
      marksheet10thEligible: result.is_eligible ?? null,
      marksheet10thData: result.data ?? null
    })
    
    return result
  }

  const handleMarksheet12thUpload = async (file: File): Promise<VerificationResponse> => {
    onDataChange({ 
      ...data, 
      marksheet12th: file, 
      marksheet12thVerified: false, 
      marksheet12thEligible: null,
      marksheet12thData: null
    })
    
    const result = await verifyMarksheet(file, '12th', firstName, lastName)
    
    onDataChange({
      ...data,
      marksheet12th: file,
      marksheet12thVerified: result.success,
      marksheet12thEligible: result.is_eligible ?? null,
      marksheet12thData: result.data ?? null
    })
    
    return result
  }

  const handleGraduationUpload = async (file: File): Promise<VerificationResponse> => {
    onDataChange({ 
      ...data, 
      graduationMarksheet: file, 
      graduationVerified: false, 
      graduationEligible: null,
      graduationData: null
    })
    
    const result = await verifyMarksheet(file, 'graduation', firstName, lastName)
    
    onDataChange({
      ...data,
      graduationMarksheet: file,
      graduationVerified: result.success,
      graduationEligible: result.is_eligible ?? null,
      graduationData: result.data ?? null
    })
    
    return result
  }

  const validate = () => {
    const newErrors: string[] = []
    
    if (!data.form16) newErrors.push('form16')
    if (!data.marksheet10th && !data.marksheet12th) {
      newErrors.push('marksheet')
    }

    // Check eligibility
    if (data.form16Eligible === false) {
      newErrors.push('form16_ineligible')
    }
    if (data.casteEligible === false) {
      newErrors.push('caste_ineligible')
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onNext()
    }
  }

  const uploadedCount = [
    data.form16,
    data.casteCertificate,
    data.marksheet10th,
    data.marksheet12th,
    data.graduationMarksheet
  ].filter(Boolean).length

  const hasEligibilityIssues = data.form16Eligible === false || data.casteEligible === false || 
    data.marksheet10thEligible === false || data.marksheet12thEligible === false || data.graduationEligible === false

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 bg-gradient-to-b from-red-500 to-pink-500 rounded-full" />
          <h2 className="text-2xl font-bold text-gray-800">Upload Documents</h2>
        </div>
        
        {/* Progress Indicator */}
        <div className="hidden sm:flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
            {uploadedCount}
          </div>
          <span className="text-sm text-gray-600">
            of 5 uploaded
          </span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900">AI-Powered Document Verification</h4>
            <p className="text-sm text-blue-700 mt-1">
              All documents are automatically verified using AI. 
              <br />• Form 16: Income must be ≤ ₹8,00,000
              <br />• Caste Certificate: Must belong to SC/ST category
              <br />• Marksheets: Percentage/CGPA will be ≥ 80% 
            </p>
          </div>
        </div>
      </div>

      {/* Eligibility Error Banner */}
      {hasEligibilityIssues && (
        <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h4 className="font-semibold text-red-900">Eligibility Issues Detected</h4>
              <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
                {data.form16Eligible === false && (
                  <li>Income exceeds ₹8,00,000 limit based on Form 16</li>
                )}
                {data.casteEligible === false && (
                  <li>Caste certificate verification failed or you don't belong to SC/ST category</li>
                )}
                {data.marksheet10thEligible === false && (
                  <li>10th marksheet: Percentage is below the required 80%</li>
                )}
                {data.marksheet12thEligible === false && (
                  <li>12th marksheet: Percentage is below the required 80%</li>
                )}
                {data.graduationEligible === false && (
                  <li>Graduation marksheet: Percentage is below the required 80%</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Required Documents Error */}
      {errors.includes('form16') || errors.includes('casteCertificate') || errors.includes('marksheet') ? (
        <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-100 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-900">Required Documents Missing</h4>
              <p className="text-sm text-amber-700 mt-1">
                Please upload Form 16, Caste Certificate, and at least one marksheet to continue.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Document Upload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form 16 */}
        <DocumentUploadCard
          title="Form 16"
          description="Income tax Form 16 for income verification (must be ≤ ₹8L)"
          icon={<Receipt className="w-6 h-6" />}
          required
          onUpload={handleForm16Upload}
        />

        {/* Caste Certificate */}
        <DocumentUploadCard
          title="Caste Certificate"
          description={`SC/ST certificate for ${firstName} ${lastName}`}
          icon={<Shield className="w-6 h-6" />}
          onUpload={handleCasteUpload}
        />

        {/* 10th Marksheet */}
        <DocumentUploadCard
          title="10th Marksheet"
          description="Secondary School Certificate (SSC) marksheet"
          icon={<FileText className="w-6 h-6" />}
          onUpload={handleMarksheet10thUpload}
        />

        {/* 12th Marksheet */}
        <DocumentUploadCard
          title="12th Marksheet"
          description="Higher Secondary Certificate (HSC) marksheet"
          icon={<FileText className="w-6 h-6" />}
          onUpload={handleMarksheet12thUpload}
        />

        {/* Graduation Marksheet */}
        <div className="lg:col-span-2">
          <DocumentUploadCard
            title="Graduation Marksheet"
            description="Bachelor's degree final year marksheet (if applicable)"
            icon={<GraduationCap className="w-6 h-6" />}
            onUpload={handleGraduationUpload}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-10 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="group flex items-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-semibold transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        
        <button
          type="submit"
          disabled={hasEligibilityIssues}
          className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg ${
            hasEligibilityIssues
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 hover:from-red-600 hover:via-pink-600 hover:to-purple-600 text-white hover:shadow-xl hover:scale-105 btn-shine'
          }`}
        >
          Save & Continue
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </form>
  )
}
