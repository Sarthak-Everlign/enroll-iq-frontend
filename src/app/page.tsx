"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Stepper from "@/components/Stepper";
import Login, { UserData } from "@/components/steps/Login";
import AadharPanVerification, {
  AadharDetails,
} from "@/components/steps/AadharPanVerification";
import PersonalDetails, {
  PersonalFormData,
  PrefillData,
} from "@/components/steps/PersonalDetails";
import VideoKYC, { KYCData } from "@/components/steps/VideoKYC";
import UploadDocuments, {
  DocumentsFormData,
} from "@/components/steps/UploadDocuments";
import Summary from "@/components/steps/Summary";
import {
  getAuthToken,
  getStoredUser,
  logout as apiLogout,
  getCurrentUser,
  getApplication,
  updateApplicationStep,
} from "@/lib/api";
import { Loader2, CheckCircle2 } from "lucide-react";

export interface Application {
  id: string;
  user_id: string;

  current_step: number;
  application_status: "draft" | "submitted" | "approved" | "rejected" | string;

  full_name: string | null;
  father_name: string | null;
  mother_name: string | null;
  gender: string | null;
  marital_status: string | null;
  mother_tongue: string | null;
  tribe: string | null;
  category: string | null;

  email: string | null;
  phone: string | null;

  dob_day: number | null;
  dob_month: number | null;
  dob_year: number | null;

  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;

  aadhaar_number: string | null;
  aadhaar_verified: boolean;

  pan_number: string | null;
  pan_verified: boolean;

  caste_validity_cert_number: string | null;
  caste_validity_issue_date: string | null;
  certificate_issue_date: string | null;
  st_certificate_number: string | null;

  permanent_mark1: string | null;
  permanent_mark2: string | null;

  isSubmitted: boolean;
  submitted_at: string | null;

  created_at: string;
  updated_at: string;
}

const initialPersonalData: PersonalFormData = {
  fullName: "",
  fatherName: "",
  motherName: "",
  maritalStatus: "",
  dobYear: "",
  dobMonth: "",
  dobDay: "",
  gender: "",
  aadhaarNumber: "",
  motherTongue: "",
  permanentMark1: "",
  permanentMark2: "",
  tribe: "",
  stCertificateNumber: "",
  certificateIssueDate: "",
  casteValidityCertNumber: "",
  casteValidityIssueDate: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  email: "",
  category: "",
};

const initialDocumentsData: DocumentsFormData = {
  form16: null,
  form16S3Key: null,
  form16S3Url: null,
  form16Father: null,
  form16FatherS3Key: null,
  form16FatherS3Url: null,
  form16Mother: null,
  form16MotherS3Key: null,
  form16MotherS3Url: null,
  casteCertificate: null,
  casteS3Key: null,
  casteS3Url: null,
  marksheet10th: null,
  marksheet10thS3Key: null,
  marksheet10thS3Url: null,
  marksheet12th: null,
  marksheet12thS3Key: null,
  marksheet12thS3Url: null,
  graduationMarksheet: null,
  graduationS3Key: null,
  graduationS3Url: null,
  offerLetter: null,
  offerLetterS3Key: null,
  offerLetterS3Url: null,
  bankPassbook: null,
  bankPassbookS3Key: null,
  bankPassbookS3Url: null,
  statementOfPurpose: null,
  statementOfPurposeS3Key: null,
  statementOfPurposeS3Url: null,
  cv: null,
  cvS3Key: null,
  cvS3Url: null,
  noPreviousScholarship: false,
  courseFullTimeEligible: false,
  // Category
  category: "",
  // Caste certificate details
  casteCertificateNumber: "",
  casteCertificateIssueDate: "",
  // University details
  universityId: null,
  universityName: "",
  course: "",
  courseDegreeType: "",
  totalFees: "",
  courseField: "",
  incomeLessThan8L: "",
  applicantEarning: "",
  fatherEarning: "",
  motherEarning: "",
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isApplicationSubmitted, setIsApplicationSubmitted] = useState(false);

  const [aadharDetails, setAadharDetails] = useState<AadharDetails | null>(
    null
  );
  const [personalData, setPersonalData] =
    useState<PersonalFormData>(initialPersonalData);
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [documentsData, setDocumentsData] =
    useState<DocumentsFormData>(initialDocumentsData);

  const [applicationData, setApplicationData] = useState<Application | null>(
    null
  );

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    const token = getAuthToken();
    const storedUser = getStoredUser();

    if (token && storedUser) {
      const response = await getCurrentUser();

      if (response.success && response.user) {
        setUserData({
          id: String(response.user.id),
          username: response.user.username || response.user.email.split("@")[0],
          email: response.user.email,
          phone: response.user.phone || "",
        });
        setIsLoggedIn(true);

        await loadApplicationData();
      }
    }

    setIsLoading(false);
  };

  const loadApplicationData = async () => {
    const response = await getApplication();

    if (response.success && response.data) {
      const app = response.data as any;

      if (app.application_status !== "in_progress") {
        setIsApplicationSubmitted(true);
        // If application is submitted or rejected, show step 5 (Summary)
        setCurrentStep(5);
      } else if (app.current_step) {
        // Otherwise restore the current step
        setCurrentStep(app.current_step);
      }
      setApplicationData(app);

      // ✅ Load personal details from database (flat structure)
      setPersonalData({
        fullName: app.full_name || "",
        fatherName: app.father_name || "",
        motherName: app.mother_name || "",
        maritalStatus: app.marital_status || "",
        dobYear: app.dob_year || "",
        dobMonth: app.dob_month || "",
        dobDay: app.dob_day || "",
        gender: app.gender || "",
        aadhaarNumber: app.aadhaar_number || "",
        motherTongue: app.mother_tongue || "",
        permanentMark1: app.permanent_mark1 || "",
        permanentMark2: app.permanent_mark2 || "",
        tribe: app.tribe || "",
        stCertificateNumber: app.st_certificate_number || "",
        certificateIssueDate: app.certificate_issue_date || "",
        casteValidityCertNumber: app.caste_validity_cert_number || "",
        casteValidityIssueDate: app.caste_validity_issue_date || "",
        address: app.address || "",
        city: app.city || "",
        state: app.state || "",
        pincode: app.pincode || "",
        phone: app.phone || "",
        email: app.email || "",
        category: app.category || "",
      });
    }
  };

  const handleLoginSuccess = async (user: UserData) => {
    setUserData(user);
    setIsLoggedIn(true);
    await loadApplicationData();
  };

  const handleLogout = async () => {
    await apiLogout();
    setIsLoggedIn(false);
    setUserData(null);
    setCurrentStep(1);
    setIsApplicationSubmitted(false);
    setAadharDetails(null);
    setPersonalData(initialPersonalData);
    setKycData(null);
    setDocumentsData(initialDocumentsData);
  };

  const handleNext = async () => {
    if (currentStep < 5) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      await updateApplicationStep(nextStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStepClick = async (step: number) => {
    setCurrentStep(step);
    await updateApplicationStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAadharVerified = (details: AadharDetails | null) => {
    if (details) {
      setAadharDetails(details);
    }
    handleNext();
  };

  const handleKycComplete = (data: KYCData | null) => {
    if (data) {
      setKycData(data);
    }
    handleNext();
  };

  const handlePersonalDataChange = (data: PersonalFormData) => {
    setPersonalData(data);
  };

  const handleDocumentsDataChange = (data: DocumentsFormData) => {
    setDocumentsData(data);
  };

  const getPrefillData = (): PrefillData | null => {
    if (!aadharDetails) return null;
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
    };
  };

  if (isLoading) {
    const backgroundGradient =
      "radial-gradient(at 51% 67%, hsla(216,71%,87%,1) 0px, transparent 50%)," +
      "radial-gradient(at 34% 21%, hsla(214,83%,92%,1) 0px, transparent 50%)," +
      "radial-gradient(at 56% 37%, hsla(205,100%,98%,1) 0px, transparent 50%)," +
      "radial-gradient(at 1% 2%, hsla(217,65%,69%,1) 0px, transparent 50%)," +
      "radial-gradient(at 8% 75%, hsla(217,65%,71%,1) 0px, transparent 50%)," +
      "radial-gradient(at 67% 94%, hsla(217,65%,73%,1) 0px, transparent 50%)," +
      "radial-gradient(at 0% 98%, hsla(209,89%,60%,1) 0px, transparent 50%)";

    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: backgroundGradient,
          backgroundColor: "#C9D7FF",
        }}
      >
        <div className="relative z-10 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-pattern">
      <Header userName={userData?.username} onLogout={handleLogout} />

      {/* <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-6 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            <span className="gradient-text">Scholarship</span> Application
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm lg:text-base">
            Complete the steps to submit your scholarship application.
          </p>
          
          {isApplicationSubmitted && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/50 text-green-300 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Application Already Submitted
            </div>
          )}
        </div>
      </div> */}

      <div className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          <Stepper currentStep={currentStep} onStepClick={handleStepClick} />
        </div>
      </div>
      {/* application id last 4 digits capitalized */}
      <div className="text-center text-gray-600 text-sm mt-4 mb-4">
        Application ID: {applicationData?.id?.slice(-6).toUpperCase()}
      </div>
      <main className="flex-1 pb-6 lg:pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl shadow-xl p-6 lg:p-10">
            {currentStep === 1 && (
              <AadharPanVerification
                onNext={handleAadharVerified}
                onBack={handleLogout}
              />
            )}

            {currentStep === 2 && (
              <VideoKYC
                onNext={handleKycComplete}
                onBack={handleBack}
                userName={
                  aadharDetails?.fullName || userData?.username || "User"
                }
                applicationId={
                  (applicationData as any)?.application_id ||
                  (applicationData as any)?.id ||
                  String(applicationData?.id || "")
                }
              />
            )}

            {currentStep === 3 && (
              <PersonalDetails
                onNext={handleNext}
                onBack={handleBack}
                data={personalData}
                onDataChange={handlePersonalDataChange}
                prefillData={getPrefillData()}
              />
            )}

            {currentStep === 4 && (
              <UploadDocuments
                onBack={handleBack}
                data={documentsData}
                onDataChange={handleDocumentsDataChange}
                personalData={personalData}
                isApplicationSubmitted={isApplicationSubmitted}
                onSubmissionSuccess={() => setIsApplicationSubmitted(true)}
                applicationId={
                  (applicationData as any)?.application_id ||
                  (applicationData as any)?.id ||
                  String(applicationData?.id || "")
                }
                applicationData={applicationData}
              />
            )}

            {currentStep === 5 && (
              <Summary
                onBack={handleBack}
                applicationData={applicationData}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
