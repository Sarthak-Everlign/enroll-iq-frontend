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
  updateApplicationStep,
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
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  
  const [aadharDetails, setAadharDetails] = useState<AadharDetails | null>(null)
  const [personalData, setPersonalData] = useState<PersonalFormData>(initialPersonalData)
  const [kycData, setKycData] = useState<KYCData | null>(null)
  const [documentsData, setDocumentsData] = useState<DocumentsFormData>(initialDocumentsData)
  const [universityData, setUniversityData] = useState<UniversityFormData>(initialUniversityData)

  useEffect(() => {
    checkExistingSession()
  }, [])

  const checkExistingSession = async () => {
    const token = getAuthToken()
    const storedUser = getStoredUser()
    
    if (token && storedUser) {
      const response = await getCurrentUser()
      
      if (response.success && response.user) {
        setUserData({
          id: String(response.user.id),
          username: response.user.username || response.user.email.split('@')[0],
          email: response.user.email,
          phone: response.user.phone || '',
        })
        setIsLoggedIn(true)
        
        await loadApplicationData()
      }
    }
    
    setIsLoading(false)
  }

  const loadApplicationData = async () => {
    const response = await getApplication()
    
    if (response.success && response.data) {
      // The actual response.data has flat structure (from ApplicationDB.to_dict())
      const app = response.data as any // Use any to access flat structure
      
      console.log('✅ Loaded application data:', app)
      
      // Restore step
      if (app.current_step) {
        setCurrentStep(app.current_step)
      }
      
      // ✅ Load personal details from database (flat structure)
      setPersonalData({
        fullName: app.full_name || '',
        fatherName: app.father_name || '',
        motherName: app.mother_name || '',
        maritalStatus: app.marital_status || '',
        dobYear: app.dob_year || '',
        dobMonth: app.dob_month || '',
        dobDay: app.dob_day || '',
        gender: app.gender || '',
        aadhaarNumber: app.aadhaar_number || '',
        motherTongue: app.mother_tongue || '',
        permanentMark1: app.permanent_mark1 || '',
        permanentMark2: app.permanent_mark2 || '',
        tribe: app.tribe || '',
        stCertificateNumber: app.st_certificate_number || '',
        certificateIssueDate: app.certificate_issue_date || '',
        casteValidityCertNumber: app.caste_validity_cert_number || '',
        casteValidityIssueDate: app.caste_validity_issue_date || '',
        address: app.address || '',
        city: app.city || '',
        state: app.state || '',
        pincode: app.pincode || '',
        phone: app.phone || '',
        email: app.email || '',
      })
      
      console.log('✅ Personal data loaded successfully')
    }
  }

  const handleLoginSuccess = async (user: UserData) => {
    setUserData(user)
    setIsLoggedIn(true)
    await loadApplicationData()
  }

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

  const handleNext = async () => {
    if (currentStep < 5) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      await updateApplicationStep(nextStep)
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
    setCurrentStep(step)
    await updateApplicationStep(step)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAadharVerified = (details: AadharDetails | null) => {
    if (details) {
      setAadharDetails(details)
    }
    handleNext()
  }

  const handleKycComplete = (data: KYCData | null) => {
    if (data) {
      setKycData(data)
    }
    handleNext()
  }

  const handlePersonalDataChange = (data: PersonalFormData) => {
    setPersonalData(data)
  }

  const handleDocumentsDataChange = (data: DocumentsFormData) => {
    setDocumentsData(data)
  }

  const handleUniversityDataChange = (data: UniversityFormData) => {
    setUniversityData(data)
  }

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

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen flex flex-col bg-pattern">
      <Header userName={userData?.username} onLogout={handleLogout} />
      
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

      <div className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          <Stepper currentStep={currentStep} onStepClick={handleStepClick} />
        </div>
      </div>

      <main className="flex-1 py-6 lg:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl shadow-xl p-6 lg:p-10">
            {currentStep === 1 && (
              <AadharPanVerification
                onNext={handleAadharVerified}
                onBack={handleLogout}
              />
            )}
            
            {currentStep === 2 && (
              <PersonalDetails
                onNext={handleNext}
                onBack={handleBack}
                data={personalData}
                onDataChange={handlePersonalDataChange}
                prefillData={getPrefillData()}
              />
            )}
            
            {currentStep === 3 && (
              <VideoKYC
                onNext={handleKycComplete}
                onBack={handleBack}
                userName={aadharDetails?.fullName || userData?.username || 'User'}
              />
            )}
            
            {currentStep === 4 && (
              <UploadDocuments
                onNext={handleNext}
                onBack={handleBack}
                data={documentsData}
                onDataChange={handleDocumentsDataChange}
                personalData={{ fullName: personalData.fullName }}
              />
            )}
            
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
    </div>
  )
}