'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Stepper from '@/components/Stepper'
import Login, { UserData } from '@/components/steps/Login'
import AadharPanVerification, { AadharDetails } from '@/components/steps/AadharPanVerification'
import PersonalDetails, { PersonalFormData, PrefillData } from '@/components/steps/PersonalDetails'
import VideoKYC, { KYCData } from '@/components/steps/VideoKYC'
import UploadDocuments, { DocumentsFormData } from '@/components/steps/UploadDocuments'
import UniversityDetails, { UniversityFormData } from '@/components/steps/UniversityDetails'

const initialPersonalData: PersonalFormData = {
  fullName: '',
  fatherName: '',
  motherName: '',
  maritalStatus: '',
  dobYear: '',
  dobMonth: '',
  dobDay: '',
  gender: '',
  aadhaarNumber: '',
  motherTongue: '',
  permanentMark1: '',
  permanentMark2: '',
  tribe: '',
  stCertificateNumber: '',
  certificateIssueDate: '',
  casteValidityCertNumber: '',
  casteValidityIssueDate: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  phone: '',
  email: '',
}

const initialDocumentsData: DocumentsFormData = {
  form16: null,
  form16Verified: false,
  form16Eligible: null,
  form16Data: null,
  casteCertificate: null,
  casteVerified: false,
  casteEligible: null,
  casteData: null,
  marksheet10th: null,
  marksheet10thVerified: false,
  marksheet10thEligible: null,
  marksheet10thData: null,
  marksheet12th: null,
  marksheet12thVerified: false,
  marksheet12thEligible: null,
  marksheet12thData: null,
  graduationMarksheet: null,
  graduationVerified: false,
  graduationEligible: null,
  graduationData: null,
}

const initialUniversityData: UniversityFormData = {
  university: '',
  course: '',
  totalFees: '',
  offerLetter: null,
  feesPageUrl: '',
  isVerified: false,
}

export default function Home() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  
  // Step state (after login)
  const [currentStep, setCurrentStep] = useState(1)
  
  // Form data states
  const [aadharDetails, setAadharDetails] = useState<AadharDetails | null>(null)
  const [personalData, setPersonalData] = useState<PersonalFormData>(initialPersonalData)
  const [kycData, setKycData] = useState<KYCData | null>(null)
  const [documentsData, setDocumentsData] = useState<DocumentsFormData>(initialDocumentsData)
  const [universityData, setUniversityData] = useState<UniversityFormData>(initialUniversityData)

  // Login handler
  const handleLoginSuccess = (user: UserData) => {
    setUserData(user)
    setIsLoggedIn(true)
  }

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserData(null)
    setCurrentStep(1)
    setAadharDetails(null)
    setPersonalData(initialPersonalData)
    setKycData(null)
    setDocumentsData(initialDocumentsData)
    setUniversityData(initialUniversityData)
  }

  // Navigation handlers
  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleStepClick = (step: number) => {
    // Allow navigation to any step (no validation required)
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Aadhar verification complete handler (can be null if skipped)
  const handleAadharVerified = (details: AadharDetails | null) => {
    if (details) {
      setAadharDetails(details)
    }
    handleNext()
  }

  // KYC complete handler (can be null if skipped)
  const handleKycComplete = (data: KYCData | null) => {
    if (data) {
      setKycData(data)
    }
    handleNext()
  }

  // Create prefill data for personal details from aadhar
  const getPrefillData = (): PrefillData | null => {
    if (!aadharDetails) return null
    return {
      fullName: aadharDetails.fullName,
      fatherName: aadharDetails.fatherName,
      dob: aadharDetails.dob,
      gender: aadharDetails.gender,
      address: aadharDetails.address,
      city: aadharDetails.city,
      state: aadharDetails.state,
      pincode: aadharDetails.pincode,
      phone: aadharDetails.phone,
      aadhaarNumber: aadharDetails.aadharNumber,
    }
  }

  // If not logged in, show login page
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen flex flex-col bg-pattern">
      <Header userName={userData?.username} onLogout={handleLogout} />
      
      {/* Page Title Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-6 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            <span className="gradient-text">Scholarship</span> Application
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm lg:text-base">
            Complete the steps to submit your scholarship application.
          </p>
        </div>
      </div>

      {/* Stepper Section */}
      <div className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          <Stepper currentStep={currentStep} onStepClick={handleStepClick} />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 py-6 lg:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl shadow-xl p-6 lg:p-10">
            {/* Step 1: Aadhar & PAN Verification */}
            {currentStep === 1 && (
              <AadharPanVerification
                onNext={handleAadharVerified}
                onBack={handleLogout}
              />
            )}
            
            {/* Step 2: Personal Details */}
            {currentStep === 2 && (
              <PersonalDetails
                onNext={handleNext}
                onBack={handleBack}
                data={personalData}
                onDataChange={setPersonalData}
                prefillData={getPrefillData()}
              />
            )}
            
            {/* Step 3: Video KYC */}
            {currentStep === 3 && (
              <VideoKYC
                onNext={handleKycComplete}
                onBack={handleBack}
                userName={aadharDetails?.fullName || userData?.username || 'User'}
              />
            )}
            
            {/* Step 4: Upload Documents */}
            {currentStep === 4 && (
              <UploadDocuments
                onNext={handleNext}
                onBack={handleBack}
                data={documentsData}
                onDataChange={setDocumentsData}
                personalData={{ fullName: personalData.fullName }}
              />
            )}
            
            {/* Step 5: University Details */}
            {currentStep === 5 && (
              <UniversityDetails
                onBack={handleBack}
                data={universityData}
                onDataChange={setUniversityData}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">Enroll<span className="text-pink-500">IQ</span></h3>
                <p className="text-xs text-gray-400">Smart Enrollment Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact Us</a>
            </div>
            
            <p className="text-sm text-gray-500">
              © 2025 Enroll IQ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
