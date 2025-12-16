'use client'

import { useState, useEffect } from 'react'
import FormInput from '@/components/FormInput'
import FormSelect from '@/components/FormSelect'
import { ArrowRight, ArrowLeft, Sparkles, CheckCircle2, Lock } from 'lucide-react'

interface PersonalDetailsProps {
  onNext: () => void
  onBack?: () => void
  data: PersonalFormData
  onDataChange: (data: PersonalFormData) => void
  prefillData?: PrefillData | null
}

export interface PrefillData {
  fullName: string
  fatherName: string
  dob: string
  gender: string
  address: string
  city: string
  state: string
  pincode: string
  phone: string
  aadhaarNumber: string
}

export interface PersonalFormData {
  fullName: string
  fatherName: string
  motherName: string
  maritalStatus: string
  dobYear: string
  dobMonth: string
  dobDay: string
  gender: string
  aadhaarNumber: string
  motherTongue: string
  permanentMark1: string
  permanentMark2: string
  tribe: string
  stCertificateNumber: string
  certificateIssueDate: string
  casteValidityCertNumber: string
  casteValidityIssueDate: string
  address: string
  city: string
  state: string
  pincode: string
  phone: string
  email: string
}

const maritalStatusOptions = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
]

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

const tribeOptions = [
  { value: 'arrakh', label: 'Arrakh' },
  { value: 'bhil', label: 'Bhil' },
  { value: 'gond', label: 'Gond' },
  { value: 'halba', label: 'Halba' },
  { value: 'katkari', label: 'Katkari' },
  { value: 'kolam', label: 'Kolam' },
  { value: 'korku', label: 'Korku' },
  { value: 'mahadev_koli', label: 'Mahadev Koli' },
  { value: 'oraon', label: 'Oraon' },
  { value: 'pardhi', label: 'Pardhi' },
  { value: 'thakur', label: 'Thakur' },
  { value: 'varli', label: 'Varli' },
  { value: 'other', label: 'Other' },
]

const stateOptions = [
  { value: 'maharashtra', label: 'Maharashtra' },
  { value: 'karnataka', label: 'Karnataka' },
  { value: 'tamil_nadu', label: 'Tamil Nadu' },
  { value: 'gujarat', label: 'Gujarat' },
  { value: 'rajasthan', label: 'Rajasthan' },
  { value: 'west_bengal', label: 'West Bengal' },
  { value: 'uttar_pradesh', label: 'Uttar Pradesh' },
  { value: 'madhya_pradesh', label: 'Madhya Pradesh' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'telangana', label: 'Telangana' },
]

const years = Array.from({ length: 50 }, (_, i) => ({
  value: String(2006 - i),
  label: String(2006 - i),
}))

const months = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

const days = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1).padStart(2, '0'),
  label: String(i + 1),
}))

export default function PersonalDetails({ onNext, onBack, data, onDataChange, prefillData }: PersonalDetailsProps) {
  // Validation removed - errors state kept for potential future use
  const [errors] = useState<Partial<Record<keyof PersonalFormData, string>>>({})
  const [hasPrefilledData, setHasPrefilledData] = useState(false)

  // Auto-fill data from Aadhar verification
  useEffect(() => {
    if (prefillData && !hasPrefilledData) {
      // Parse the date string (YYYY-MM-DD format)
      const dobParts = prefillData.dob.split('-')
      const year = dobParts[0] || ''
      const month = dobParts[1] || ''
      const day = dobParts[2] || ''

      onDataChange({
        ...data,
        fullName: prefillData.fullName,
        fatherName: prefillData.fatherName,
        dobYear: year,
        dobMonth: month,
        dobDay: day,
        gender: prefillData.gender,
        aadhaarNumber: prefillData.aadhaarNumber,
        address: prefillData.address,
        city: prefillData.city,
        state: prefillData.state,
        pincode: prefillData.pincode,
        phone: prefillData.phone,
      })
      setHasPrefilledData(true)
    }
  }, [prefillData, hasPrefilledData, data, onDataChange])

  const handleChange = (field: keyof PersonalFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    onDataChange({ ...data, [field]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // No validation required - user can proceed without filling all fields
    onNext()
  }

  // Check if field was auto-filled from Aadhar
  const isAadharField = (field: keyof PersonalFormData) => {
    const aadharFields: (keyof PersonalFormData)[] = [
      'fullName', 'fatherName', 'dobYear', 'dobMonth', 'dobDay', 
      'gender', 'aadhaarNumber', 'address', 'city', 'state', 'pincode', 'phone'
    ]
    return !!prefillData && aadharFields.includes(field)
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-1.5 bg-gradient-to-b from-red-500 to-pink-500 rounded-full" />
        <h2 className="text-2xl font-bold text-gray-800">Personal Details</h2>
        <Sparkles className="w-5 h-5 text-pink-500" />
      </div>

      {/* Aadhar Auto-fill Notice */}
      {prefillData && (
        <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Aadhaar Data Auto-filled</h3>
              <p className="text-sm text-green-700">
                Fields marked with <Lock className="w-3 h-3 inline" /> are verified from your Aadhaar and cannot be edited.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <FormInput
              label="Full Name"
              name="fullName"
              placeholder="Enter your full name"
              value={data.fullName}
              onChange={handleChange('fullName')}
              disabled={isAadharField('fullName')}
            />
            {isAadharField('fullName') && (
              <Lock className="absolute right-3 top-9 w-4 h-4 text-green-500" />
            )}
          </div>
          <div className="relative">
            <FormInput
              label="Father's Name"
              name="fatherName"
              placeholder="Enter father's name"
              value={data.fatherName}
              onChange={handleChange('fatherName')}
              disabled={isAadharField('fatherName')}
            />
            {isAadharField('fatherName') && (
              <Lock className="absolute right-3 top-9 w-4 h-4 text-green-500" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Mother's Name"
            name="motherName"
            placeholder="Enter mother's name"
            value={data.motherName}
            onChange={handleChange('motherName')}
          />
          <FormSelect
            label="Marital Status"
            name="maritalStatus"
            options={maritalStatusOptions}
            value={data.maritalStatus}
            onChange={handleChange('maritalStatus')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Date of Birth
              {isAadharField('dobYear') && <Lock className="w-3 h-3 inline ml-2 text-green-500" />}
            </label>
            <div className="grid grid-cols-3 gap-3">
              <FormSelect
                label=""
                name="dobYear"
                options={years}
                value={data.dobYear}
                onChange={handleChange('dobYear')}
                placeholder="Year"
                disabled={isAadharField('dobYear')}
              />
              <FormSelect
                label=""
                name="dobMonth"
                options={months}
                value={data.dobMonth}
                onChange={handleChange('dobMonth')}
                placeholder="Month"
                disabled={isAadharField('dobMonth')}
              />
              <FormSelect
                label=""
                name="dobDay"
                options={days}
                value={data.dobDay}
                onChange={handleChange('dobDay')}
                placeholder="Day"
                disabled={isAadharField('dobDay')}
              />
            </div>
          </div>
          <div className="relative">
            <FormSelect
              label="Gender"
              name="gender"
              options={genderOptions}
              value={data.gender}
              onChange={handleChange('gender')}
              disabled={isAadharField('gender')}
            />
            {isAadharField('gender') && (
              <Lock className="absolute right-3 top-9 w-4 h-4 text-green-500" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <FormInput
              label="Aadhaar Number"
              name="aadhaarNumber"
              placeholder="Enter 12-digit Aadhaar number"
              value={data.aadhaarNumber}
              onChange={handleChange('aadhaarNumber')}
              disabled={isAadharField('aadhaarNumber')}
            />
            {isAadharField('aadhaarNumber') && (
              <Lock className="absolute right-3 top-9 w-4 h-4 text-green-500" />
            )}
          </div>
          <FormInput
            label="Mother's Tongue"
            name="motherTongue"
            placeholder="Enter mother tongue"
            value={data.motherTongue}
            onChange={handleChange('motherTongue')}
          />
        </div>

        {/* Tribal Information Section */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-6 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
            <h3 className="text-lg font-semibold text-gray-800">Tribal Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput
              label="Permanent Visible Mark 1"
              name="permanentMark1"
              placeholder="Permanent Visible Mark 1"
              value={data.permanentMark1}
              onChange={handleChange('permanentMark1')}
            />
            <FormInput
              label="Permanent Visible Mark 2"
              name="permanentMark2"
              placeholder="Permanent Visible Mark 2"
              value={data.permanentMark2}
              onChange={handleChange('permanentMark2')}
            />
            <FormSelect
              label="Select Tribe"
              name="tribe"
              options={tribeOptions}
              value={data.tribe}
              onChange={handleChange('tribe')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <FormInput
              label="ST Certificate Number"
              name="stCertificateNumber"
              placeholder="ST Certificate Number"
              value={data.stCertificateNumber}
              onChange={handleChange('stCertificateNumber')}
            />
            <FormInput
              label="Certificate Issue Date"
              name="certificateIssueDate"
              type="date"
              value={data.certificateIssueDate}
              onChange={handleChange('certificateIssueDate')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <FormInput
              label="Caste Validity Certificate Number"
              name="casteValidityCertNumber"
              placeholder="Caste Validity Number"
              value={data.casteValidityCertNumber}
              onChange={handleChange('casteValidityCertNumber')}
            />
            <FormInput
              label="Caste Validity Issue Date"
              name="casteValidityIssueDate"
              type="date"
              value={data.casteValidityIssueDate}
              onChange={handleChange('casteValidityIssueDate')}
            />
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-6 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
            <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
            {prefillData && <Lock className="w-4 h-4 text-green-500" />}
          </div>

          <div className="space-y-6">
            <div className="relative">
              <FormInput
                label="Address"
                name="address"
                placeholder="Enter your full address"
                value={data.address}
                onChange={handleChange('address')}
                disabled={isAadharField('address')}
              />
              {isAadharField('address') && (
                <Lock className="absolute right-3 top-9 w-4 h-4 text-green-500" />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <FormInput
                  label="City"
                  name="city"
                  placeholder="Enter city"
                  value={data.city}
                  onChange={handleChange('city')}
                  disabled={isAadharField('city')}
                />
                {isAadharField('city') && (
                  <Lock className="absolute right-3 top-9 w-4 h-4 text-green-500" />
                )}
              </div>
              <div className="relative">
                <FormSelect
                  label="State"
                  name="state"
                  options={stateOptions}
                  value={data.state}
                  onChange={handleChange('state')}
                  disabled={isAadharField('state')}
                />
                {isAadharField('state') && (
                  <Lock className="absolute right-3 top-9 w-4 h-4 text-green-500" />
                )}
              </div>
              <div className="relative">
                <FormInput
                  label="Pincode"
                  name="pincode"
                  placeholder="Enter pincode"
                  value={data.pincode}
                  onChange={handleChange('pincode')}
                  disabled={isAadharField('pincode')}
                />
                {isAadharField('pincode') && (
                  <Lock className="absolute right-3 top-9 w-4 h-4 text-green-500" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <FormInput
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={data.phone}
                  onChange={handleChange('phone')}
                  disabled={isAadharField('phone')}
                />
                {isAadharField('phone') && (
                  <Lock className="absolute right-3 top-9 w-4 h-4 text-green-500" />
                )}
              </div>
              <FormInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={data.email}
                onChange={handleChange('email')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-10 flex items-center justify-between">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        ) : (
          <div />
        )}
        <button
          type="submit"
          className="group flex items-center gap-3 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 hover:from-red-600 hover:via-pink-600 hover:to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 btn-shine"
        >
          Save & Continue
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </form>
  )
}
