'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Stepper from '@/components/Stepper'
import Login, { UserData } from '@/components/steps/Login'
import AadharPanVerification, { AadharDetails } from '@/components/steps/AadharPanVerification'
import PersonalDetails, { PersonalFormData, PrefillData } from '@/components/steps/PersonalDetails'
import VideoKYC, { KYCData } from '@/components/steps/VideoKYC'
import UploadDocuments, { DocumentsFormData } from '@/components/steps/UploadDocuments'
import UniversityDetails, { UniversityFormData } from '@/components/steps/UniversityDetails'
import { 
  getAuthToken, 
  getStoredUser, 
  logout as apiLogout,
  getCurrentUser,
  getApplication,
  updatePersonalDetails,
  updateDocuments,
  updateUniversityDetails,
  updateApplicationStep,
  type ApplicationData
} from '@/lib/api'
import { Loader2 } from 'lucide-react'

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
  universityId: null,
  universityName: '',
  course: '',
  courseDegreeType: '',
  totalFees: '',
  offerLetter: null,
  feesPageUrl: '',
  isVerified: false,
}

export default function Home() {
  // Loading state for initial auth check
  const [isLoading, setIsLoading] = useState(true)
  
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

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession()
  }, [])

  const checkExistingSession = async () => {
    const token = getAuthToken()
    const storedUser = getStoredUser()
    
    if (token && storedUser) {
      // Verify token is still valid
      const response = await getCurrentUser()
      
      if (response.success && response.user) {
        setUserData({
          id: String(response.user.id),
          username: response.user.username || response.user.email.split('@')[0],
          email: response.user.email,
          phone: response.user.phone || '',
        })
        setIsLoggedIn(true)
        
        // Load application data
        await loadApplicationData()
      }
    }
    
    setIsLoading(false)
  }

  const loadApplicationData = async () => {
    const response = await getApplication()
    
    if (response.success && response.data) {
      const app = response.data
      
      // Restore step
      if (app.current_step) {
        setCurrentStep(app.current_step)
      }
      
      // Restore personal details
      if (app.personal_details) {
        const pd = app.personal_details
        const dob = pd.date_of_birth ? pd.date_of_birth.split('-') : ['', '', '']
        
        setPersonalData({
          ...initialPersonalData,
          fullName: pd.full_name || '',
          fatherName: pd.father_name || '',
          dobYear: dob[0] || '',
          dobMonth: dob[1] || '',
          dobDay: dob[2] || '',
          gender: pd.gender || '',
          address: pd.address || '',
          city: pd.city || '',
          state: pd.state || '',
          pincode: pd.pincode || '',
          phone: pd.phone || '',
          email: pd.email || '',
        })
      }
      
      // Restore documents data
      if (app.documents) {
        const docs = app.documents
        setDocumentsData({
          ...initialDocumentsData,
          marksheet10thVerified: docs.marksheet_10th?.verified || false,
          marksheet10thEligible: docs.marksheet_10th?.eligible ?? null,
          marksheet10thData: docs.marksheet_10th?.data || null,
          marksheet12thVerified: docs.marksheet_12th?.verified || false,
          marksheet12thEligible: docs.marksheet_12th?.eligible ?? null,
          marksheet12thData: docs.marksheet_12th?.data || null,
          graduationVerified: docs.graduation?.verified || false,
          graduationEligible: docs.graduation?.eligible ?? null,
          graduationData: docs.graduation?.data || null,
          form16Verified: docs.form16?.verified || false,
          form16Eligible: docs.form16?.eligible ?? null,
          casteVerified: docs.caste_certificate?.verified || false,
        })
      }
      
      // Restore university data
      if (app.university) {
        const uni = app.university
        setUniversityData({
          ...initialUniversityData,
          universityId: uni.university_id,
          universityName: uni.university_name || '',
          course: uni.course_name || '',
          courseDegreeType: uni.course_degree_type || '',
          totalFees: uni.total_fees_usd ? String(uni.total_fees_usd) : '',
          feesPageUrl: uni.fees_page_url || '',
          isVerified: uni.fees_verified || false,
        })
      }
    }
  }

  // Save personal details to backend
  const savePersonalDetails = async (data: PersonalFormData) => {
    const dob = data.dobYear && data.dobMonth && data.dobDay 
      ? `${data.dobYear}-${data.dobMonth}-${data.dobDay}` 
      : null
    
    await updatePersonalDetails({
      full_name: data.fullName || null,
      father_name: data.fatherName || null,
      date_of_birth: dob,
      gender: data.gender || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      pincode: data.pincode || null,
      phone: data.phone || null,
      email: data.email || null,
    })
  }

  // Save documents data to backend
  const saveDocumentsData = async (data: DocumentsFormData) => {
    await updateDocuments({
      marksheet_10th_verified: data.marksheet10thVerified,
      marksheet_10th_eligible: data.marksheet10thEligible,
      marksheet_10th_data: data.marksheet10thData,
      marksheet_10th_percentage: data.marksheet10thData?.percentage || null,
      marksheet_12th_verified: data.marksheet12thVerified,
      marksheet_12th_eligible: data.marksheet12thEligible,
      marksheet_12th_data: data.marksheet12thData,
      marksheet_12th_percentage: data.marksheet12thData?.percentage || null,
      graduation_verified: data.graduationVerified,
      graduation_eligible: data.graduationEligible,
      graduation_data: data.graduationData,
      graduation_percentage: data.graduationData?.percentage || null,
      form16_verified: data.form16Verified,
      form16_eligible: data.form16Eligible,
      caste_certificate_verified: data.casteVerified,
    })
  }

  // Save university data to backend
  const saveUniversityData = async (data: UniversityFormData) => {
    await updateUniversityDetails({
      university_id: data.universityId,
      university_name: data.universityName || null,
      course_name: data.course || null,
      course_degree_type: data.courseDegreeType || null,
      total_fees_usd: data.totalFees ? parseFloat(data.totalFees) : null,
      total_fees_inr: data.totalFees ? parseFloat(data.totalFees) * 83 : null,
      fees_page_url: data.feesPageUrl || null,
      fees_verified: data.isVerified,
      fees_verification_status: data.verificationResult?.status || null,
    })
  }

  // Login handler
  const handleLoginSuccess = async (user: UserData) => {
    setUserData(user)
    setIsLoggedIn(true)
    
    // Load existing application data
    await loadApplicationData()
  }

  // Logout handler
  const handleLogout = async () => {
    await apiLogout()
    setIsLoggedIn(false)
    setUserData(null)
    setCurrentStep(1)
    setAadharDetails(null)
    setPersonalData(initialPersonalData)
    setKycData(null)
    setDocumentsData(initialDocumentsData)
    setUniversityData(initialUniversityData)
  }

  // Navigation handlers with auto-save
  const handleNext = async () => {
    if (currentStep < 5) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      
      // Save current step data and update step on backend
      await updateApplicationStep(nextStep)
      
      // Save current step's data
      if (currentStep === 2) {
        await savePersonalDetails(personalData)
      } else if (currentStep === 4) {
        await saveDocumentsData(documentsData)
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleStepClick = async (step: number) => {
    // Save current step data before navigating
    if (currentStep === 2) {
      await savePersonalDetails(personalData)
    } else if (currentStep === 4) {
      await saveDocumentsData(documentsData)
    } else if (currentStep === 5) {
      await saveUniversityData(universityData)
    }
    
    setCurrentStep(step)
    await updateApplicationStep(step)
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

  // Personal data change handler with auto-save
  const handlePersonalDataChange = (data: PersonalFormData) => {
    setPersonalData(data)
  }

  // Documents data change handler with auto-save
  const handleDocumentsDataChange = (data: DocumentsFormData) => {
    setDocumentsData(data)
    // Save immediately when verification status changes
    if (data.marksheet10thVerified !== documentsData.marksheet10thVerified ||
        data.marksheet12thVerified !== documentsData.marksheet12thVerified ||
        data.graduationVerified !== documentsData.graduationVerified) {
      saveDocumentsData(data)
    }
  }

  // University data change handler with auto-save
  const handleUniversityDataChange = (data: UniversityFormData) => {
    setUniversityData(data)
    // Save immediately when verification completes
    if (data.isVerified !== universityData.isVerified) {
      saveUniversityData(data)
    }
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

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
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
                onDataChange={handlePersonalDataChange}
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
                onDataChange={handleDocumentsDataChange}
                personalData={{ fullName: personalData.fullName }}
              />
            )}
            
            {/* Step 5: University Details */}
            {currentStep === 5 && (
              <UniversityDetails
                onBack={handleBack}
                data={universityData}
                onDataChange={handleUniversityDataChange}
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
