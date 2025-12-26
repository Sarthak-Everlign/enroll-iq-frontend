"use client";

import { useState } from "react";
import DocumentUploadCard from "@/components/DocumentUploadCard";
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
} from "lucide-react";
import {
  uploadToS3,
  checkS3DocumentsStatus,
  type S3UploadResponse,
} from "@/lib/api";

interface UploadDocumentsProps {
  onNext: () => void;
  onBack: () => void;
  data: DocumentsFormData;
  onDataChange: (data: DocumentsFormData) => void;
  personalData: {
    fullName: string;
  };
  applicationId?: string;
}

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
}

export default function UploadDocuments({
  onNext,
  onBack,
  data,
  onDataChange,
  personalData,
  applicationId,
}: UploadDocumentsProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

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

      // Update local state with file
      onDataChange({
        ...data,
        [fileMap[documentType]]: file,
      });

      // Upload to S3
      const result = await uploadToS3(file, pathMap[documentType], {
        applicationId,
        fileName: file.name,
      });

      if (result.success && result.data) {
        // Update with S3 info
        onDataChange({
          ...data,
          [fileMap[documentType]]: file,
          [s3KeyMap[documentType]]: result.data.s3Key,
          [s3UrlMap[documentType]]: result.data.s3Url,
        });
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
    const isValid = await validate();
    if (isValid) {
      onNext();
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

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
          <h2 className="text-2xl font-bold text-gray-800">Upload Documents</h2>
        </div>

        {/* Progress Indicator */}
        <div className="hidden sm:flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
            {uploadedCount}
          </div>
          <span className="text-sm text-gray-600">of 9 uploaded</span>
        </div>
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
            />
          </div>
        </div>

        {/* Identity Documents Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Identity Documents
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DocumentUploadCard
              title="Caste Certificate"
              description="SC/ST certificate"
              icon={<Shield className="w-6 h-6" />}
              onUpload={handleCasteUpload}
              applicationId={applicationId}
              documentPath="enroll_iq_files/submission_files/{applicationId}/documents/caste_certificate/"
            />
          </div>
        </div>

        {/* Academic Documents Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <GraduationCap className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Academic Documents
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DocumentUploadCard
              title="10th Marksheet"
              description="Secondary School Certificate (SSC) marksheet"
              icon={<FileText className="w-6 h-6" />}
              onUpload={handleMarksheet10thUpload}
              applicationId={applicationId}
              documentPath="enroll_iq_files/submission_files/{applicationId}/documents/marksheet_10th/"
            />

            <DocumentUploadCard
              title="12th Marksheet"
              description="Higher Secondary Certificate (HSC) marksheet"
              icon={<FileText className="w-6 h-6" />}
              onUpload={handleMarksheet12thUpload}
              applicationId={applicationId}
              documentPath="enroll_iq_files/submission_files/{applicationId}/documents/marksheet_12th/"
            />

            <div className="lg:col-span-2">
              <DocumentUploadCard
                title="Graduation Marksheet"
                description="Bachelor's degree final year marksheet (if applicable)"
                icon={<GraduationCap className="w-6 h-6" />}
                onUpload={handleGraduationUpload}
                applicationId={applicationId}
                documentPath="enroll_iq_files/submission_files/{applicationId}/documents/graduation/"
              />
            </div>
          </div>
        </div>

        {/* University Documents Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              University Documents
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DocumentUploadCard
              title="Offer Letter"
              description="From Foreign University (Top 200 QS Ranking)"
              icon={<Building2 className="w-6 h-6" />}
              onUpload={handleOfferLetterUpload}
              applicationId={applicationId}
              documentPath="enroll_iq_files/submission_files/{applicationId}/documents/offer_letter/"
            />
          </div>
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

        {/* Declarations Section */}
        {/* <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <CheckSquare className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Declarations
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
                  I confirm that the course I am applying for is full-time and
                  eligible for scholarship
                </p>
              </div>
            </label>
          </div>
        </div> */}
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
          disabled={isValidating}
          className="group flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg text-white hover:shadow-xl hover:scale-105 btn-shine disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  backgroundImage: "linear-gradient(#81E5FF -22.92%, rgba(254, 200, 241, 0) 26.73%), radial-gradient(137.13% 253.39% at 76.68% 66.67%, #3644CF 0%, #85F3FF 100%)",
                  boxShadow: "0 10px 24px rgba(54, 68, 207, 0.35)",
                }}
        >
          {isValidating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Validating...
            </>
          ) : (
            <>
              Save & Continue
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
