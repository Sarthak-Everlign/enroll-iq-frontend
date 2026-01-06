"use client";

import { useState, useEffect } from "react";
import DocumentUploadCard from "@/components/DocumentUploadCard";
import SearchableSelect from "@/components/SearchableSelect";
import FormSelect from "@/components/FormSelect";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Shield,
  AlertTriangle,
  Receipt,
  GraduationCap,
  Building2,
  CreditCard,
  FileCheck,
  CheckSquare,
  DollarSign,
  HelpCircle,
  Loader2,
  CheckCircle2,
  Download,
} from "lucide-react";
import {
  uploadToS3,
  checkS3DocumentsStatus,
  fetchUniversities,
  updateUniversityDetailsWithFile,
  submitApplication,
  verifySingleDocument,
  getValidationResultByApplicationId,
  type S3UploadResponse,
  type University,
  type VerifySingleDocumentResponse,
} from "@/lib/api";
import { generateApplicationPDF } from "@/lib/pdfGenerator";
import { PersonalFormData } from "./PersonalDetails";

interface UploadDocumentsProps {
  onBack: () => void;
  data: DocumentsFormData;
  onDataChange: (data: DocumentsFormData) => void;
  personalData: PersonalFormData;
  applicationId?: string;
  isApplicationSubmitted?: boolean;
  onSubmissionSuccess?: () => void;
  applicationData?: any;
}

// Tooltip component
function Tooltip({
  children,
  content,
}: {
  children: React.ReactNode;
  content: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-50 bottom-full right-0 mb-2 px-2.5 py-1.5 text-xs text-white bg-gray-900 rounded-lg shadow-lg whitespace-normal max-w-xs">
          {content}
          <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

export const defaultCourses = [
  { value: "ms", label: "M.S", degreeType: "M.S" },
  { value: "phd", label: "PhD", degreeType: "PhD" },
];

export const courseFields = [
  { value: "Engineering", label: "Engineering" },
  { value: "Architecture", label: "Architecture" },
  { value: "Management", label: "Management" },
  { value: "Science", label: "Science" },
  { value: "Commerce/Economics", label: "Commerce/Economics" },
  { value: "Arts", label: "Arts" },
  { value: "Law", label: "Law" },
  { value: "Pharmaceutical Sciences", label: "Pharmaceutical Sciences" },
];

export interface DocumentsFormData {
  form16: File | null;
  form16S3Key: string | null;
  form16S3Url: string | null;
  casteCertificate: File | null;
  casteS3Key: string | null;
  casteS3Url: string | null;
  marksheet10th: File | null;
  marksheet10thS3Key: string | null;
  marksheet10thS3Url: string | null;
  marksheet12th: File | null;
  marksheet12thS3Key: string | null;
  marksheet12thS3Url: string | null;
  graduationMarksheet: File | null;
  graduationS3Key: string | null;
  graduationS3Url: string | null;
  offerLetter: File | null;
  offerLetterS3Key: string | null;
  offerLetterS3Url: string | null;
  bankPassbook: File | null;
  bankPassbookS3Key: string | null;
  bankPassbookS3Url: string | null;
  statementOfPurpose: File | null;
  statementOfPurposeS3Key: string | null;
  statementOfPurposeS3Url: string | null;
  cv: File | null;
  cvS3Key: string | null;
  cvS3Url: string | null;
  noPreviousScholarship: boolean;
  courseFullTimeEligible: boolean;
  // Category (SC/ST)
  category: string;
  // Caste certificate details
  casteCertificateNumber: string;
  casteCertificateIssueDate: string;
  // University details
  universityId: number | null;
  universityName: string;
  course: string;
  courseDegreeType: string;
  totalFees: string;
  courseField: string;
}

export default function UploadDocuments({
  onBack,
  data,
  onDataChange,
  personalData,
  applicationId,
  isApplicationSubmitted,
  onSubmissionSuccess,
  applicationData,
}: UploadDocumentsProps) {
  console.log(applicationData);
  const [errors, setErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loadingUniversities, setLoadingUniversities] = useState(true);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [universityErrors, setUniversityErrors] = useState<
    Record<string, string>
  >({});

  // Track verification status for each document
  const [verificationStatus, setVerificationStatus] = useState<
    Record<
      string,
      {
        isVerifying: boolean;
        verified: boolean | null;
        result?: any;
        error?: string;
      }
    >
  >({});

  // ─────────────────────────────────────────────
  // Derived helpers (DO NOT put inside useEffect)
  // ─────────────────────────────────────────────

  const isEligible = (key: string) =>
    verificationStatus[key]?.verified === true;

  const exists = (key: string) => verificationStatus[key] !== undefined;

  const sectionVisibility = {
    caste: () => exists("form16") && isEligible("form16"),
    academics: () => exists("caste") && isEligible("caste"),
    otherDetails: () => exists("marksheet12th") && isEligible("marksheet12th"),
  };

  console.log(sectionVisibility.caste());

  // Track overall application eligibility
  const [isApplicationEligible, setIsApplicationEligible] = useState<
    boolean | null
  >(null);
  const [ineligibleDocuments, setIneligibleDocuments] = useState<string[]>([]);

  const REQUIRED_DOC_KEYS = [
    "form16",
    "caste",
    "marksheet10th",
    "marksheet12th",
    "graduation",
  ] as const;

  useEffect(() => {
    if (Object.keys(verificationStatus).length === 0) return;

    let allPresent = true;
    let allEligible = true;
    const ineligible: string[] = [];

    for (const key of REQUIRED_DOC_KEYS) {
      const status = verificationStatus[key];

      if (!status) {
        allPresent = false;
        continue; // 🔑 missing ≠ failed
      }

      if (status.verified === false) {
        allEligible = false;
        ineligible.push(key);
      }

      if (status.verified === null) {
        allEligible = false; // still processing
      }
    }

    // 1️⃣ Rejection dominates
    if (!allEligible && ineligible.length > 0) {
      setIsApplicationEligible(false);
      setIneligibleDocuments(ineligible);
      return;
    }

    // 2️⃣ Pending (missing docs, no failures)
    if (!allPresent) {
      setIsApplicationEligible(null);
      setIneligibleDocuments([]);
      return;
    }

    // 3️⃣ Fully eligible
    setIsApplicationEligible(true);
    setIneligibleDocuments([]);
  }, [verificationStatus]);

  // Fetch universities on mount
  useEffect(() => {
    async function loadUniversities() {
      setLoadingUniversities(true);
      try {
        const response = await fetchUniversities();
        setUniversities(response.universities);
      } catch (error) {
        console.error("Failed to load universities:", error);
      } finally {
        setLoadingUniversities(false);
      }
    }
    loadUniversities();
  }, []);

  // Load validation results on mount
  useEffect(() => {
    async function loadValidationResults() {
      if (!applicationId) return;

      try {
        const response = await getValidationResultByApplicationId(
          applicationId
        );

        if (
          response.success &&
          response.validation_result?.verification_results
        ) {
          const results = response.validation_result.verification_results;
          const newVerificationStatus: Record<
            string,
            {
              isVerifying: boolean;
              verified: boolean | null;
              result?: any;
              error?: string;
            }
          > = {};

          // Map API results to frontend document types
          const documentTypeMap: Record<string, string> = {
            form16: "form16",
            caste_certificate: "caste",
            marksheet_10th: "marksheet10th",
            marksheet_12th: "marksheet12th",
            marksheet_graduation: "graduation",
          };

          const apiTypeToDisplayName: Record<string, string> = {
            form16: "Form 16",
            caste_certificate: "Caste Certificate",
            marksheet_10th: "10th Marksheet",
            marksheet_12th: "12th Marksheet",
            marksheet_graduation: "Graduation Marksheet",
          };

          Object.entries(results).forEach(([apiType, result]) => {
            const frontendType = documentTypeMap[apiType];
            if (frontendType && result) {
              newVerificationStatus[frontendType] = {
                isVerifying: false,
                verified: result.is_eligible,
                result: {
                  message: result.message,
                  data: result.data,
                },
              };
            }
          });

          setVerificationStatus(newVerificationStatus);

          // // Check eligibility - all required documents must be present and eligible
          // const requiredDocuments = [
          //   "form16",
          //   "caste_certificate",
          //   "marksheet_10th",
          //   "marksheet_12th",
          //   "marksheet_graduation",
          // ];

          // const allDocumentsPresent = requiredDocuments.every(
          //   (doc) => results[doc as keyof typeof results]
          // );

          // // if (allDocumentsPresent) {
          // const ineligibleDocs: string[] = [];
          // let allEligible: boolean = true;

          // requiredDocuments.forEach((doc) => {
          //   const result = results[doc as keyof typeof results];
          //   if (result && !result.is_eligible) {
          //     allEligible = false;
          //     ineligibleDocs.push(apiTypeToDisplayName[doc] || doc);
          //   }
          // });

          // if (allDocumentsPresent || !allEligible) {
          //   setIsApplicationEligible(allEligible);
          //   setIneligibleDocuments(ineligibleDocs);
          // } else {
          //   // Not all documents verified yet
          //   setIsApplicationEligible(null);
          //   setIneligibleDocuments([]);
          // }
        }
      } catch (error) {
        console.error("Failed to load validation results:", error);
      }
    }

    loadValidationResults();
  }, [applicationId]);

  // Convert universities to options for SearchableSelect
  const universityOptions = universities.map((u) => ({
    value: String(u.id),
    label: u.name,
    country: u.country,
    rank: u.rank,
    overall_score: u.overall_score,
  }));

  const selectedUniversity = universities.find(
    (u) => u.id === data.universityId
  );

  if (!applicationId) {
    return (
      <div className="animate-fade-in">
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
          <p className="text-red-700">
            Application ID is required to upload documents.
          </p>
        </div>
      </div>
    );
  }

  // Generic upload handler
  const createUploadHandler = (
    documentType:
      | "form16"
      | "caste"
      | "marksheet10th"
      | "marksheet12th"
      | "graduation"
      | "offerLetter"
      | "bankPassbook"
      | "statementOfPurpose"
      | "cv"
  ) => {
    return async (file: File): Promise<S3UploadResponse> => {
      const pathMap: Record<string, string> = {
        form16: `enroll_iq_files/submission_files/{applicationId}/documents/form16/`,
        caste: `enroll_iq_files/submission_files/{applicationId}/documents/caste_certificate/`,
        marksheet10th: `enroll_iq_files/submission_files/{applicationId}/documents/marksheet_10th/`,
        marksheet12th: `enroll_iq_files/submission_files/{applicationId}/documents/marksheet_12th/`,
        graduation: `enroll_iq_files/submission_files/{applicationId}/documents/graduation/`,
        offerLetter: `enroll_iq_files/submission_files/{applicationId}/documents/offer_letter/`,
        bankPassbook: `enroll_iq_files/submission_files/{applicationId}/documents/bank_passbook/`,
        statementOfPurpose: `enroll_iq_files/submission_files/{applicationId}/documents/statement_of_purpose/`,
        cv: `enroll_iq_files/submission_files/{applicationId}/documents/cv/`,
      };

      const s3KeyMap: Record<string, keyof DocumentsFormData> = {
        form16: "form16S3Key",
        caste: "casteS3Key",
        marksheet10th: "marksheet10thS3Key",
        marksheet12th: "marksheet12thS3Key",
        graduation: "graduationS3Key",
        offerLetter: "offerLetterS3Key",
        bankPassbook: "bankPassbookS3Key",
        statementOfPurpose: "statementOfPurposeS3Key",
        cv: "cvS3Key",
      };

      const s3UrlMap: Record<string, keyof DocumentsFormData> = {
        form16: "form16S3Url",
        caste: "casteS3Url",
        marksheet10th: "marksheet10thS3Url",
        marksheet12th: "marksheet12thS3Url",
        graduation: "graduationS3Url",
        offerLetter: "offerLetterS3Url",
        bankPassbook: "bankPassbookS3Url",
        statementOfPurpose: "statementOfPurposeS3Url",
        cv: "cvS3Url",
      };

      const fileMap: Record<string, keyof DocumentsFormData> = {
        form16: "form16",
        caste: "casteCertificate",
        marksheet10th: "marksheet10th",
        marksheet12th: "marksheet12th",
        graduation: "graduationMarksheet",
        offerLetter: "offerLetter",
        bankPassbook: "bankPassbook",
        statementOfPurpose: "statementOfPurpose",
        cv: "cv",
      };

      // Map to FastAPI document types
      const verificationTypeMap: Record<
        string,
        | "form16"
        | "caste_certificate"
        | "marksheet_10th"
        | "marksheet_12th"
        | "marksheet_graduation"
      > = {
        form16: "form16",
        caste: "caste_certificate",
        marksheet10th: "marksheet_10th",
        marksheet12th: "marksheet_12th",
        graduation: "marksheet_graduation",
      };

      // Update local state with file
      onDataChange({
        ...data,
        [fileMap[documentType]]: file,
      });

      // Upload to S3
      const result = await uploadToS3(file, pathMap[documentType], {
        applicationId,
        fileName: documentType,
      });

      if (result.success && result.data) {
        // Update with S3 info
        onDataChange({
          ...data,
          [fileMap[documentType]]: file,
          [s3KeyMap[documentType]]: result.data.s3Key,
          [s3UrlMap[documentType]]: result.data.s3Url,
        });

        // Verify document if it's one of the verifiable types
        const verificationType = verificationTypeMap[documentType];
        if (verificationType && applicationId) {
          // Set verifying state
          setVerificationStatus((prev) => ({
            ...prev,
            [documentType]: {
              isVerifying: true,
              verified: null,
            },
          }));

          try {
            const verificationResult = await verifySingleDocument(
              applicationId,
              verificationType
            );

            setVerificationStatus((prev) => {
              const updatedStatus = {
                ...prev,
                [documentType]: {
                  isVerifying: false,
                  verified: verificationResult.verified,
                  result: verificationResult.result,
                },
              };

              // // Check eligibility after verification completes
              // const requiredDocuments = [
              //   { key: "form16", name: "Form 16" },
              //   { key: "caste", name: "Caste Certificate" },
              //   { key: "marksheet10th", name: "10th Marksheet" },
              //   { key: "marksheet12th", name: "12th Marksheet" },
              //   { key: "graduation", name: "Graduation Marksheet" },
              // ];

              // const allDocumentsPresent = requiredDocuments.every(
              //   (doc) => updatedStatus[doc.key] !== undefined
              // );

              // if (allDocumentsPresent) {
              //   const ineligibleDocs: string[] = [];
              //   let allEligible = true;

              //   requiredDocuments.forEach((doc) => {
              //     const status = updatedStatus[doc.key];
              //     if (status && status.verified === false) {
              //       allEligible = false;
              //       ineligibleDocs.push(doc.name);
              //     }
              //   });

              //   setIsApplicationEligible(allEligible);
              //   setIneligibleDocuments(ineligibleDocs);
              // }

              return updatedStatus;
            });
          } catch (error) {
            console.error(`Verification error for ${documentType}:`, error);
            setVerificationStatus((prev) => ({
              ...prev,
              [documentType]: {
                isVerifying: false,
                verified: false,
                error:
                  error instanceof Error
                    ? error.message
                    : "Verification failed",
              },
            }));
          }
        }
      }

      return result;
    };
  };

  const handleForm16Upload = createUploadHandler("form16");
  const handleCasteUpload = createUploadHandler("caste");
  const handleMarksheet10thUpload = createUploadHandler("marksheet10th");
  const handleMarksheet12thUpload = createUploadHandler("marksheet12th");
  const handleGraduationUpload = createUploadHandler("graduation");
  const handleOfferLetterUpload = createUploadHandler("offerLetter");
  const handleBankPassbookUpload = createUploadHandler("bankPassbook");
  const handleStatementOfPurposeUpload =
    createUploadHandler("statementOfPurpose");
  const handleCvUpload = createUploadHandler("cv");

  const handleCheckboxChange = (
    field: "noPreviousScholarship" | "courseFullTimeEligible",
    checked: boolean
  ) => {
    onDataChange({
      ...data,
      [field]: checked,
    });
  };

  // Category change handler
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onDataChange({
      ...data,
      category: e.target.value,
    });
  };

  // University handlers
  const handleUniversityChange = (value: string) => {
    const uni = universities.find((u) => String(u.id) === value);
    onDataChange({
      ...data,
      universityId: uni?.id || null,
      universityName: uni?.name || "",
      course: "",
      courseDegreeType: "",
      totalFees: "",
    });
    if (universityErrors.universityId) {
      setUniversityErrors({ ...universityErrors, universityId: "" });
    }
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCourse = defaultCourses.find(
      (c) => c.label === e.target.value
    );
    if (selectedCourse) {
      onDataChange({
        ...data,
        course: selectedCourse.label,
        courseDegreeType: selectedCourse.degreeType,
      });
    }
    if (universityErrors.course) {
      setUniversityErrors({ ...universityErrors, course: "" });
    }
  };

  const handleCourseFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCourse = courseFields.find((c) => c.label === e.target.value);
    console.log(selectedCourse);
    if (selectedCourse) {
      onDataChange({
        ...data,
        courseField: selectedCourse.value,
      });
    }
  };

  const handleFeesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    onDataChange({
      ...data,
      totalFees: value,
    });
    if (universityErrors.totalFees) {
      setUniversityErrors({ ...universityErrors, totalFees: "" });
    }
  };

  const handleDownloadPDF = () => {
    setIsDownloadingPDF(true);

    try {
      const pdfData = {
        // Personal Details
        fullName: personalData?.fullName || "",
        fatherName: personalData?.fatherName || "",
        motherName: personalData?.motherName || "",
        maritalStatus: personalData?.maritalStatus || "",
        dob:
          personalData?.dobYear &&
          personalData?.dobMonth &&
          personalData?.dobDay
            ? `${personalData.dobDay}/${personalData.dobMonth}/${personalData.dobYear}`
            : "",
        gender: personalData?.gender || "",
        aadhaarNumber: personalData?.aadhaarNumber || "",
        panNumber: "",
        motherTongue: personalData?.motherTongue || "",
        permanentMark1: personalData?.permanentMark1 || "",
        permanentMark2: personalData?.permanentMark2 || "",

        tribe: personalData?.tribe || "",
        stCertificateNumber: personalData?.stCertificateNumber || "",
        certificateIssueDate: personalData?.certificateIssueDate || "",
        casteValidityCertNumber: personalData?.casteValidityCertNumber || "",
        casteValidityIssueDate: personalData?.casteValidityIssueDate || "",

        address: personalData?.address || "",
        city: personalData?.city || "",
        state: personalData?.state || "",
        pincode: personalData?.pincode || "",
        phone: personalData?.phone || "",
        email: personalData?.email || "",

        universityName: data.universityName,
        universityCountry: selectedUniversity?.country || "",
        course: data.course,
        courseDegreeType: data.courseDegreeType,
        totalFees: data.totalFees,
        feesPageUrl: "",
        isVerified: false,

        documents: {
          form16: data.form16 ? true : false,
          casteCertificate: data.casteCertificate ? true : false,
          marksheet10th: data.marksheet10th ? true : false,
          marksheet12th: data.marksheet12th ? true : false,
          graduationMarksheet: data.graduationMarksheet ? true : false,
          offerLetter: data.offerLetter ? true : false,
        },
      };

      generateApplicationPDF(pdfData);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const validate = async (): Promise<boolean> => {
    if (!applicationId) {
      setErrors(["applicationId"]);
      return false;
    }

    setIsValidating(true);
    setErrors([]);

    try {
      // Check S3 for all documents
      const result = await checkS3DocumentsStatus(applicationId);

      if (!result.success || !result.data) {
        setErrors(["validation_error"]);
        setIsValidating(false);
        return false;
      }

      const documentStatus = result.data;
      const newErrors: string[] = [];

      // Check if Form 16 is uploaded
      if (!documentStatus.form16?.exists) {
        newErrors.push("form16");
      }

      // Check if at least one marksheet is uploaded (10th or 12th)
      if (
        !documentStatus.marksheet10th?.exists &&
        !documentStatus.marksheet12th?.exists
      ) {
        newErrors.push("marksheet");
      }

      // Update local state with S3 keys if they exist (for display purposes)
      if (documentStatus.form16?.exists && documentStatus.form16.s3Key) {
        onDataChange({
          ...data,
          form16S3Key: documentStatus.form16.s3Key,
          form16S3Url: documentStatus.form16.s3Url || null,
        });
      }
      if (
        documentStatus.marksheet10th?.exists &&
        documentStatus.marksheet10th.s3Key
      ) {
        onDataChange({
          ...data,
          marksheet10thS3Key: documentStatus.marksheet10th.s3Key,
          marksheet10thS3Url: documentStatus.marksheet10th.s3Url || null,
        });
      }
      if (
        documentStatus.marksheet12th?.exists &&
        documentStatus.marksheet12th.s3Key
      ) {
        onDataChange({
          ...data,
          marksheet12thS3Key: documentStatus.marksheet12th.s3Key,
          marksheet12thS3Url: documentStatus.marksheet12th.s3Url || null,
        });
      }
      if (documentStatus.caste?.exists && documentStatus.caste.s3Key) {
        onDataChange({
          ...data,
          casteS3Key: documentStatus.caste.s3Key,
          casteS3Url: documentStatus.caste.s3Url || null,
        });
      }
      if (
        documentStatus.graduation?.exists &&
        documentStatus.graduation.s3Key
      ) {
        onDataChange({
          ...data,
          graduationS3Key: documentStatus.graduation.s3Key,
          graduationS3Url: documentStatus.graduation.s3Url || null,
        });
      }
      if (
        documentStatus.offerLetter?.exists &&
        documentStatus.offerLetter.s3Key
      ) {
        onDataChange({
          ...data,
          offerLetterS3Key: documentStatus.offerLetter.s3Key,
          offerLetterS3Url: documentStatus.offerLetter.s3Url || null,
        });
      }
      if (
        documentStatus.bankPassbook?.exists &&
        documentStatus.bankPassbook.s3Key
      ) {
        onDataChange({
          ...data,
          bankPassbookS3Key: documentStatus.bankPassbook.s3Key,
          bankPassbookS3Url: documentStatus.bankPassbook.s3Url || null,
        });
      }
      if (
        documentStatus.statementOfPurpose?.exists &&
        documentStatus.statementOfPurpose.s3Key
      ) {
        onDataChange({
          ...data,
          statementOfPurposeS3Key: documentStatus.statementOfPurpose.s3Key,
          statementOfPurposeS3Url:
            documentStatus.statementOfPurpose.s3Url || null,
        });
      }
      if (documentStatus.cv?.exists && documentStatus.cv.s3Key) {
        onDataChange({
          ...data,
          cvS3Key: documentStatus.cv.s3Key,
          cvS3Url: documentStatus.cv.s3Url || null,
        });
      }

      setErrors(newErrors);
      setIsValidating(false);
      return newErrors.length === 0;
    } catch (error) {
      console.error("Validation error:", error);
      setErrors(["validation_error"]);
      setIsValidating(false);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isApplicationSubmitted) {
      alert(
        "This application has already been submitted and cannot be resubmitted."
      );
      return;
    }

    const isValid = await validate();
    if (!isValid) {
      return;
    }

    // Validate university details
    const newUniversityErrors: Record<string, string> = {};
    if (!data.universityId) {
      newUniversityErrors.universityId = "Please select a university";
    }
    if (!data.course) {
      newUniversityErrors.course = "Please select a course";
    }
    if (!data.totalFees) {
      newUniversityErrors.totalFees = "Please enter total fees";
    }

    if (Object.keys(newUniversityErrors).length > 0) {
      setUniversityErrors(newUniversityErrors);
      alert("Please fill in all required university details");
      return;
    }

    // Check declarations
    if (!data.noPreviousScholarship || !data.courseFullTimeEligible) {
      alert("Please accept both declarations to proceed");
      return;
    }

    try {
      console.log(data.courseField);
      // Save university details
      const updateResult = await updateUniversityDetailsWithFile(
        {
          application_id: applicationId || "",
          course_name: data.course,
          course_field: data.courseField,
          total_fees_usd: parseFloat(data.totalFees),
          university_rank: selectedUniversity?.rank,
          fees_page_url: "",
          no_previous_scholarship: data.noPreviousScholarship,
          course_full_time_eligible: data.courseFullTimeEligible,
        },
        data.offerLetter || undefined
      );

      if (!updateResult.success) {
        alert(updateResult.message || "Failed to save university details");
        return;
      }

      // Submit the application
      const submitResult = await submitApplication();

      if (!submitResult.success) {
        alert(submitResult.message || "Failed to submit application");
        return;
      }

      alert("Application submitted successfully!");
      onSubmissionSuccess?.();
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit application. Please try again.");
    }
  };

  const uploadedCount = [
    data.form16S3Key,
    data.casteS3Key,
    data.marksheet10thS3Key,
    data.marksheet12thS3Key,
    data.graduationS3Key,
    data.offerLetterS3Key,
    data.bankPassbookS3Key,
    data.statementOfPurposeS3Key,
    data.cvS3Key,
  ].filter(Boolean).length;

  console.log("isValidating", isValidating);
  console.log("isApplicationEligible", isApplicationEligible);
  console.log("isApplicationSubmitted", isApplicationSubmitted);
  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
          <h2 className="text-2xl font-bold text-gray-800">Upload Documents</h2>
        </div>

        {/* Progress Indicator */}
        {/* <div className="hidden sm:flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
            {uploadedCount}
          </div>
          <span className="text-sm text-gray-600">of 9 uploaded</span>
        </div> */}
      </div>

      {/* Info Banner */}
      {/* <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900">
              Eligibility Criteria
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              All documents are automatically verified using AI.
              <br />• Form 16: Income must be ≤ ₹8,00,000
              <br />• Caste Certificate: Must belong to SC/ST category
              <br />• Marksheets: Percentage/CGPA will be ≥ 75%
            </p>
            <a
              href="https://socialjustice-fs.trti-maha.in:83/faqs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
            >
              For more details, click here
            </a>
          </div>
        </div>
      </div> */}

      {/* Required Documents Error */}
      {errors.length > 0 && !errors.includes("validation_error") && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-100 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-900">
                Required Documents Missing
              </h4>
              <ul className="text-sm text-amber-700 mt-1 list-disc list-inside space-y-1">
                {errors.includes("form16") && <li>Form 16 is required</li>}
                {errors.includes("marksheet") && (
                  <li>At least one marksheet (10th or 12th) is required</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Validation Error */}
      {errors.includes("validation_error") && (
        <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h4 className="font-semibold text-red-900">Validation Error</h4>
              <p className="text-sm text-red-700 mt-1">
                Failed to validate documents. Please try again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Sections */}
      <div className="space-y-6">
        {/* Income Details Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <Receipt className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Income Details
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DocumentUploadCard
              title="Form 16"
              description="Income tax Form 16 for income verification"
              icon={<Receipt className="w-6 h-6" />}
              required
              onUpload={handleForm16Upload}
              applicationId={applicationId}
              documentPath="enroll_iq_files/submission_files/{applicationId}/documents/form16/"
              verificationStatus={verificationStatus.form16}
            />
          </div>
        </div>

        {/* Caste Certificate Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Caste Certificate
            </h3>
          </div>

          {/* Category Dropdown */}
          {sectionVisibility.caste() && (
            <>
              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">
                        Select Category
                        <span className="text-red-500 ml-1">*</span>
                      </h3>
                      <p className="text-xs text-gray-500">
                        Choose your caste category
                      </p>
                    </div>
                  </div>
                  <Tooltip content="Select SC or ST category to upload the relevant certificate">
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </Tooltip>
                </div>

                <FormSelect
                  label=""
                  name="category"
                  options={[
                    { value: "SC", label: "SC (Scheduled Caste)" },
                    { value: "ST", label: "ST (Scheduled Tribe)" },
                  ]}
                  value={personalData.category}
                  onChange={handleCategoryChange}
                  placeholder="Select category"
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
                <DocumentUploadCard
                  title={`${data.category} Certificate`}
                  description={`Upload your ${data.category} caste certificate`}
                  icon={<Shield className="w-6 h-6" />}
                  onUpload={handleCasteUpload}
                  applicationId={applicationId}
                  documentPath="enroll_iq_files/submission_files/{applicationId}/documents/caste_certificate/"
                  verificationStatus={verificationStatus.caste}
                />
              </div>
            </>
          )}
        </div>

        {/* Academic Documents Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <GraduationCap className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Academic Documents
            </h3>
          </div>
          {sectionVisibility.academics() && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <DocumentUploadCard
                title="10th Marksheet"
                description="Secondary School Certificate (SSC) marksheet"
                icon={<FileText className="w-6 h-6" />}
                onUpload={handleMarksheet10thUpload}
                applicationId={applicationId}
                documentPath="enroll_iq_files/submission_files/{applicationId}/documents/marksheet_10th/"
                verificationStatus={verificationStatus.marksheet10th}
              />

              <DocumentUploadCard
                title="12th Marksheet"
                description="Higher Secondary Certificate (HSC) marksheet"
                icon={<FileText className="w-6 h-6" />}
                onUpload={handleMarksheet12thUpload}
                applicationId={applicationId}
                documentPath="enroll_iq_files/submission_files/{applicationId}/documents/marksheet_12th/"
                verificationStatus={verificationStatus.marksheet12th}
              />

              <div className="lg:col-span-2">
                <DocumentUploadCard
                  title="Graduation Marksheet"
                  description="Bachelor's degree final year marksheet (if applicable)"
                  icon={<GraduationCap className="w-6 h-6" />}
                  onUpload={handleGraduationUpload}
                  applicationId={applicationId}
                  documentPath="enroll_iq_files/submission_files/{applicationId}/documents/graduation/"
                  verificationStatus={verificationStatus.graduation}
                />
              </div>
            </div>
          )}
        </div>
        {sectionVisibility.otherDetails() && (
          <>
            {/* University Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  University Details
                </h3>
              </div>

              {/* Step 1: University Selection */}
              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">
                        Select Your University
                        <span className="text-red-500 ml-1">*</span>
                      </h3>
                      <p className="text-xs text-gray-500">
                        Choose from 200 partner universities
                      </p>
                    </div>
                  </div>
                  <Tooltip content="Select the university where you have received admission. We partner with 200+ universities globally.">
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </Tooltip>
                </div>

                {loadingUniversities ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                    <span className="text-sm text-gray-600">
                      Loading universities...
                    </span>
                  </div>
                ) : (
                  <SearchableSelect
                    label="University"
                    name="university"
                    options={universityOptions}
                    value={data.universityId ? String(data.universityId) : ""}
                    onChange={handleUniversityChange}
                    placeholder="Search and select university..."
                    required
                    error={universityErrors.universityId}
                  />
                )}
              </div>

              {/* Step 2: Course Selection - Only show after university is selected */}
              {/* {data.universityId && ( */}
              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">
                        Select Your Course/Program
                        <span className="text-red-500 ml-1">*</span>
                      </h3>
                      <p className="text-xs text-gray-500">
                        Select from common programs
                      </p>
                    </div>
                  </div>
                  <Tooltip content="Select the specific program you're enrolled in. Required field.">
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </Tooltip>
                </div>

                <select
                  value={applicationData.course_type || data.course || ""}
                  onChange={handleCourseChange}
                  required
                  className={`w-full px-3 py-2.5 rounded-lg border ${
                    universityErrors.course
                      ? "border-red-500"
                      : "border-gray-200"
                  } focus:border-emerald-500 outline-none transition-colors text-sm text-gray-800`}
                >
                  <option value="">-- Select a program --</option>
                  {defaultCourses.map((course) => (
                    <option key={course.value} value={course.label}>
                      {course.label}
                    </option>
                  ))}
                </select>

                {universityErrors.course && (
                  <p className="text-red-500 text-xs mt-1">
                    {universityErrors.course}
                  </p>
                )}
              </div>
              {/* )} */}

              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">
                        Select Your Program
                        <span className="text-red-500 ml-1">*</span>
                      </h3>
                      <p className="text-xs text-gray-500">
                        Select from common programs
                      </p>
                    </div>
                  </div>
                  <Tooltip content="Select the specific program you're enrolled in. Required field.">
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </Tooltip>
                </div>

                <select
                  value={applicationData.course_field || data.courseField || ""}
                  onChange={handleCourseFieldChange}
                  required
                  className={`w-full px-3 py-2.5 rounded-lg border  focus:border-emerald-500 outline-none transition-colors text-sm text-gray-800`}
                >
                  <option value="">-- Select a program --</option>
                  {courseFields.map((course) => (
                    <option key={course.value} value={course.label}>
                      {course.label}
                    </option>
                  ))}
                </select>

                {universityErrors.course && (
                  <p className="text-red-500 text-xs mt-1">
                    {universityErrors.course}
                  </p>
                )}
              </div>

              {/* Step 3: Fees Input - Only show after course is selected */}
              {/* {data.course && ( */}
              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">
                        Enter Total Fees
                        <span className="text-red-500 ml-1">*</span>
                      </h3>
                      <p className="text-xs text-gray-500">
                        Program fees in USD
                      </p>
                    </div>
                  </div>
                  <Tooltip content="Enter the total tuition/fees as mentioned in your offer letter.">
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </Tooltip>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">
                      $
                    </span>
                    <input
                      type="text"
                      name="totalFees"
                      placeholder="Enter total fees in USD"
                      value={data.totalFees}
                      onChange={handleFeesChange}
                      className={`w-full pl-8 pr-3 py-2.5 rounded-lg border ${
                        universityErrors.totalFees
                          ? "border-red-500"
                          : "border-gray-200"
                      } focus:border-amber-500 outline-none transition-colors text-sm text-gray-800 placeholder:text-gray-400`}
                    />
                  </div>

                  {universityErrors.totalFees && (
                    <p className="text-red-500 text-xs">
                      {universityErrors.totalFees}
                    </p>
                  )}
                </div>
              </div>
              {/* )} */}

              {/* Step 4: Offer Letter Upload - Only show after fees is entered */}
              {/* {data.totalFees && ( */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
                <DocumentUploadCard
                  title="Offer Letter"
                  description="From Foreign University (Top 200 QS Ranking)"
                  icon={<Building2 className="w-6 h-6" />}
                  onUpload={handleOfferLetterUpload}
                  applicationId={applicationId}
                  documentPath="enroll_iq_files/submission_files/{applicationId}/documents/offer_letter/"
                />
              </div>
              {/* )} */}
            </div>

            {/* Financial Documents Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <CreditCard className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Financial Documents
                </h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DocumentUploadCard
                  title="Bank Passbook"
                  description="First page of bank passbook"
                  icon={<CreditCard className="w-6 h-6" />}
                  onUpload={handleBankPassbookUpload}
                  applicationId={applicationId}
                  documentPath="enroll_iq_files/submission_files/{applicationId}/documents/bank_passbook/"
                />
              </div>
            </div>

            {/* Additional Documents Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <FileCheck className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Additional Documents
                </h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DocumentUploadCard
                  title="Statement of Purpose"
                  description="SOP document (if required)"
                  icon={<FileText className="w-6 h-6" />}
                  onUpload={handleStatementOfPurposeUpload}
                  applicationId={applicationId}
                  documentPath="enroll_iq_files/submission_files/{applicationId}/documents/statement_of_purpose/"
                />

                <DocumentUploadCard
                  title="CV / Resume"
                  description="Curriculum Vitae (if required)"
                  icon={<FileCheck className="w-6 h-6" />}
                  onUpload={handleCvUpload}
                  applicationId={applicationId}
                  documentPath="enroll_iq_files/submission_files/{applicationId}/documents/cv/"
                />
              </div>
            </div>

            {/* Declarations Section - Show after university details are filled */}
            {data.course && data.totalFees && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <CheckSquare className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Declarations
                    <span className="text-red-500 ml-1">*</span>
                  </h3>
                </div>
                <div className="space-y-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={data.noPreviousScholarship}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "noPreviousScholarship",
                          e.target.checked
                        )
                      }
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900">
                        No Previous Foreign Scholarship Taken Declaration
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        I declare that I have not received any previous foreign
                        scholarship
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={data.courseFullTimeEligible}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "courseFullTimeEligible",
                          e.target.checked
                        )
                      }
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900">
                        Course is Full‑time and Eligible
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        I confirm that the course I am applying for is full-time
                        and eligible for scholarship
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-10 flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          disabled={isApplicationSubmitted}
          className="group flex items-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isDownloadingPDF || isApplicationSubmitted}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-5 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloadingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </button>

          {isApplicationSubmitted && isApplicationEligible === true ? (
            <div className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md">
              <CheckCircle2 className="w-4 h-4" />
              Already Submitted
            </div>
          ) : isApplicationEligible === false ? (
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md">
                <AlertTriangle className="w-4 h-4" />
                Application Rejected
              </div>
              {ineligibleDocuments.length > 0 && (
                <p className="text-xs text-red-600 text-right">
                  Ineligible: {ineligibleDocuments.join(", ")}
                </p>
              )}
            </div>
          ) : (
            <button
              type="submit"
              disabled={isValidating || isApplicationEligible === null}
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg text-white hover:shadow-xl hover:scale-105 btn-shine disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                backgroundImage:
                  "linear-gradient(#81E5FF -22.92%, rgba(254, 200, 241, 0) 26.73%), radial-gradient(137.13% 253.39% at 76.68% 66.67%, #3644CF 0%, #85F3FF 100%)",
                boxShadow: "0 10px 24px rgba(54, 68, 207, 0.35)",
              }}
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Submit Application
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
