"use client";

import { useState, useEffect } from "react";
import SearchableSelect from "@/components/SearchableSelect";
import FormInput from "@/components/FormInput";
import FileUpload from "@/components/FileUpload";
import { generateApplicationPDF } from "@/lib/pdfGenerator";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Building2,
  GraduationCap,
  DollarSign,
  Link2,
  FileCheck,
  Info,
  XCircle,
  Receipt,
  Search,
  HelpCircle,
  AlertCircle,
  Sparkles,
  Download,
  CheckSquare,
} from "lucide-react";
import {
  fetchUniversities,
  scrapeCourses,
  verifyFees,
  submitApplication,
  updateUniversityDetailsWithFile,
  type University,
  type FeeVerificationResponse,
  type FeeItem,
  type ScrapedCourse,
  type ScrapeCoursesResponse,
} from "@/lib/api";

interface UniversityDetailsProps {
  onBack: () => void;
  data: UniversityFormData;
  onDataChange: (data: UniversityFormData) => void;
  personalData?: any;
  documentsData?: any;
  isApplicationSubmitted?: boolean;
  onSubmissionSuccess?: () => void;
  applicationId?: string;
}

export interface UniversityFormData {
  universityId: number | null;
  universityName: string;
  course: string;
  courseDegreeType: string;
  totalFees: string;
  offerLetter: File | null;
  feesPageUrl: string;
  isVerified: boolean;
  verificationResult?: FeeVerificationResponse | null;
  scrapedCourses?: ScrapedCourse[];
  noPreviousScholarship: boolean;
  courseFullTimeEligible: boolean;
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

// Default courses fallback
// const defaultCourses = [
//   {
//     value: "mba",
//     label: "Master of Business Administration (MBA)",
//     degreeType: "MBA",
//   },
//   {
//     value: "ms_cs",
//     label: "Master of Science in Computer Science",
//     degreeType: "Master's",
//   },
//   {
//     value: "ms_ds",
//     label: "Master of Science in Data Science",
//     degreeType: "Master's",
//   },
//   {
//     value: "ms_eng",
//     label: "Master of Science in Engineering",
//     degreeType: "Master's",
//   },
//   { value: "llm", label: "Master of Laws (LL.M.)", degreeType: "LL.M." },
//   { value: "ma", label: "Master of Arts (MA)", degreeType: "Master's" },
//   { value: "msc", label: "Master of Science (MSc)", degreeType: "Master's" },
//   { value: "mph", label: "Master of Public Health (MPH)", degreeType: "MPH" },
//   { value: "mba_exec", label: "Executive MBA", degreeType: "MBA" },
//   { value: "phd", label: "Doctor of Philosophy (PhD)", degreeType: "PhD" },
// ];

const defaultCourses = [
  { value: "mba", label: "MBA", degreeType: "MBA" },
  { value: "phd", label: "PHD", degreeType: "PhD" },
  { value: "bachelor", label: "Bachelor's Degree", degreeType: "Bachelor's" },
];

export default function UniversityDetails({
  onBack,
  data,
  onDataChange,
  personalData,
  documentsData,
  isApplicationSubmitted,
  onSubmissionSuccess,
  applicationId,
}: UniversityDetailsProps) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loadingUniversities, setLoadingUniversities] = useState(true);
  const [isScrapingCourses, setIsScrapingCourses] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [coursesScrapeResult, setCoursesScrapeResult] =
    useState<ScrapeCoursesResponse | null>(null);
  const [showManualCourse, setShowManualCourse] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof UniversityFormData, string>>
  >({});

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

  const handleUniversityChange = (value: string) => {
    const uni = universities.find((u) => String(u.id) === value);
    onDataChange({
      ...data,
      universityId: uni?.id || null,
      universityName: uni?.name || "",
      course: "",
      courseDegreeType: "",
      totalFees: "",
      feesPageUrl: "",
      isVerified: false,
      verificationResult: null,
      scrapedCourses: undefined,
    });
    setCoursesScrapeResult(null);
    setShowManualCourse(false);
    if (errors.universityId) {
      setErrors({ ...errors, universityId: undefined });
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDataChange({
      ...data,
      feesPageUrl: e.target.value,
      course: "",
      courseDegreeType: "",
      totalFees: "",
      isVerified: false,
      verificationResult: null,
      scrapedCourses: undefined,
    });
    setCoursesScrapeResult(null);
    setShowManualCourse(false);
    if (errors.feesPageUrl) {
      setErrors({ ...errors, feesPageUrl: undefined });
    }
  };

  const handleScrapeCourses = async () => {
    if (!data.universityId || !data.feesPageUrl) {
      setErrors({
        ...errors,
        feesPageUrl: !data.feesPageUrl
          ? "Please enter the fees page URL"
          : undefined,
      });
      return;
    }

    if (!data.feesPageUrl.match(/^https?:\/\/.+/)) {
      setErrors({
        ...errors,
        feesPageUrl:
          "Please enter a valid URL starting with http:// or https://",
      });
      return;
    }

    setIsScrapingCourses(true);
    setCoursesScrapeResult(null);

    // Clear course selection when re-scraping
    onDataChange({
      ...data,
      course: "",
      courseDegreeType: "",
      totalFees: "",
      isVerified: false,
      verificationResult: null,
    });

    try {
      const result = await scrapeCourses({
        university_id: data.universityId,
        fees_page_url: data.feesPageUrl,
      });

      setCoursesScrapeResult(result);
      onDataChange({
        ...data,
        scrapedCourses: result.courses,
        course: "",
        courseDegreeType: "",
        totalFees: "",
      });

      if (!result.courses || result.courses.length === 0) {
        setShowManualCourse(true);
      }
    } catch (error) {
      console.error("Course scraping error:", error);
      setShowManualCourse(true);
    } finally {
      setIsScrapingCourses(false);
    }
  };

  const handleCourseSelect = (course: ScrapedCourse) => {
    // Build full course name for backend verification
    const courseName = course.degree_type
      ? `${course.degree_type} - ${course.name}`
      : course.name;

    onDataChange({
      ...data,
      course: courseName,
      courseDegreeType: course.degree_type || "",
      totalFees: course.fee ? String(course.fee) : data.totalFees,
      isVerified: false,
      verificationResult: null,
    });
    if (errors.course) {
      setErrors({ ...errors, course: undefined });
    }
  };

  const handleManualCourseSelect = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedCourse = defaultCourses.find(
      (c) => c.value === e.target.value
    );
    if (selectedCourse) {
      onDataChange({
        ...data,
        course: selectedCourse.label,
        courseDegreeType: selectedCourse.degreeType,
        isVerified: false,
        verificationResult: null,
      });
    }
    if (errors.course) {
      setErrors({ ...errors, course: undefined });
    }
  };

  const handleFeesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    onDataChange({
      ...data,
      totalFees: value,
      isVerified: false,
      verificationResult: null,
    });
    if (errors.totalFees) {
      setErrors({ ...errors, totalFees: undefined });
    }
  };

  const handleFileChange = (file: File | null) => {
    onDataChange({ ...data, offerLetter: file });
    if (errors.offerLetter) {
      setErrors({ ...errors, offerLetter: undefined });
    }
  };

  const handleVerify = async () => {
    const newErrors: Partial<Record<keyof UniversityFormData, string>> = {};

    if (!data.universityId)
      newErrors.universityId = "Please select a university";
    if (!data.course) newErrors.course = "Please select a course";
    if (!data.totalFees) newErrors.totalFees = "Please enter total fees";
    if (!data.feesPageUrl) newErrors.feesPageUrl = "Please enter fees page URL";

    if (data.feesPageUrl && !data.feesPageUrl.match(/^https?:\/\/.+/)) {
      newErrors.feesPageUrl =
        "Please enter a valid URL starting with http:// or https://";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsVerifying(true);

    try {
      const result = await verifyFees({
        university_id: data.universityId!,
        course_name: data.course,
        user_fees: parseFloat(data.totalFees),
        fees_page_url: data.feesPageUrl,
      });

      onDataChange({
        ...data,
        isVerified: result.status === "accepted",
        verificationResult: result,
      });
    } catch (error) {
      console.error("Verification error:", error);
      onDataChange({
        ...data,
        isVerified: false,
        verificationResult: null,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const canSubmit =
    data.isVerified ||
    (data.verificationResult && !data.verificationResult.scraping_successful);

  const canDownloadPDF = data.universityId && data.course && data.totalFees;

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
        panNumber: personalData?.panNumber || "",
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
        feesPageUrl: data.feesPageUrl,
        isVerified: data.isVerified,

        documents: {
          form16: documentsData?.form16 ? true : false,
          casteCertificate: documentsData?.casteCertificate ? true : false,
          marksheet10th: documentsData?.marksheet10th ? true : false,
          marksheet12th: documentsData?.marksheet12th ? true : false,
          graduationMarksheet: documentsData?.graduationMarksheet
            ? true
            : false,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isApplicationSubmitted) {
      alert(
        "This application has already been submitted and cannot be resubmitted."
      );
      return;
    }

    // Validate all required fields
    const newErrors: Partial<Record<keyof UniversityFormData, string>> = {};

    if (!data.universityId)
      newErrors.universityId = "Please select a university";
    // if (!data.feesPageUrl) newErrors.feesPageUrl = "Please enter fees page URL";
    if (!data.course) newErrors.course = "Please select a course";
    // if (!data.offerLetter)
    //   newErrors.offerLetter = "Please upload offer letter" as any;
    if (!data.totalFees) newErrors.totalFees = "Please enter total fees";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Please fill in all required fields");
      return;
    }

    // Check declarations
    if (!data.noPreviousScholarship || !data.courseFullTimeEligible) {
      alert("Please accept both declarations to proceed");
      return;
    }

    // if (!canSubmit) {
    //   alert("Please verify the fees before submitting");
    //   return;
    // }

    try {
      // First, save university details with file
      const updateResult = await updateUniversityDetailsWithFile(
        {
          application_id: applicationId || "",
          course_name: data.course,
          total_fees_usd: parseFloat(data.totalFees),
          university_rank: selectedUniversity?.rank,
          fees_page_url: data.feesPageUrl,
          no_previous_scholarship: data.noPreviousScholarship,
          course_full_time_eligible: data.courseFullTimeEligible,
        },
        data.offerLetter || undefined
      );

      if (!updateResult.success) {
        alert(updateResult.message || "Failed to save university details");
        return;
      }

      // Then submit the application
      const submitResult = await submitApplication();

      if (!submitResult.success) {
        alert(submitResult.message || "Failed to submit application");
        return;
      }

      if (data.verificationResult?.status === "accepted") {
        alert("Application submitted successfully! Fees have been verified.");
      } else {
        alert(
          "Application submitted for manual review. Our team will verify the fees manually."
        );
      }

      onSubmissionSuccess?.();
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit application. Please try again.");
    }
  };

  const result = data.verificationResult;
  const scrapedCourses =
    data.scrapedCourses || coursesScrapeResult?.courses || [];
  const hasCourses = scrapedCourses.length > 0;

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-6 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
        <h2 className="text-xl font-bold text-gray-800">University Details</h2>
      </div>

      {/* Step 1: University Selection Card */}
      <div className="mb-4 p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
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
            error={errors.universityId}
          />
        )}
      </div>

      {/* Step 2: Course Selection */}
      {data.universityId && (
        <div className="mb-4">
          {/* Fees Page URL - COMMENTED OUT
          <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Official Fees Page URL
                    <span className="text-red-500 ml-1">*</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Provide the university's official tuition/fees page
                  </p>
                </div>
              </div>
              <Tooltip content="Enter the official university webpage that lists tuition fees. We'll extract available programs and fees from this page.">
                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </Tooltip>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <FormInput
                    label=""
                    name="feesPageUrl"
                    type="url"
                    placeholder="https://university.edu/tuition-fees"
                    value={data.feesPageUrl}
                    onChange={handleUrlChange}
                    required
                    error={errors.feesPageUrl}
                  />
                </div>
                {data.feesPageUrl && (
                  <a
                    href={data.feesPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-2 text-violet-600 hover:text-violet-700 text-sm font-medium hover:bg-violet-50 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Preview
                  </a>
                )}
              </div>

              {coursesScrapeResult && !coursesScrapeResult.success && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    {coursesScrapeResult.message}
                  </p>
                </div>
              )}
            </div>
          </div>
          */}

          {/* Course Selection */}
          {(
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
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
                      {hasCourses
                        ? `${scrapedCourses.length} programs found`
                        : "Select from common programs"}
                    </p>
                  </div>
                </div>
                <Tooltip content="Select the specific program you're enrolled in. Required field.">
                  <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </Tooltip>
              </div>

              {/* Course Dropdown */}
              <div className="space-y-2">
                {hasCourses ? (
                  <select
                    value={data.course}
                    onChange={(e) => {
                      const selectedCourse = scrapedCourses.find((c) => {
                        const courseName = c.degree_type
                          ? `${c.degree_type} - ${c.name}`
                          : c.name;
                        return courseName === e.target.value;
                      });
                      if (selectedCourse) {
                        handleCourseSelect(selectedCourse);
                      }
                    }}
                    required
                    className={`w-full px-3 py-2.5 rounded-lg border ${
                      errors.course ? "border-red-500" : "border-gray-200"
                    } focus:border-emerald-500 outline-none transition-colors text-sm text-gray-800`}
                  >
                    <option value="">-- Select a program --</option>
                    {scrapedCourses.map((course, index) => {
                      const courseName = course.degree_type
                        ? `${course.degree_type} - ${course.name}`
                        : course.name;
                      const feeInfo = course.fee
                        ? ` - $${course.fee.toLocaleString()}`
                        : "";
                      return (
                        <option key={index} value={courseName}>
                          {courseName}
                          {feeInfo}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <select
                    value={data.course}
                    onChange={(e) => {
                      const selectedCourse = defaultCourses.find(
                        (c) => c.label === e.target.value
                      );
                      if (selectedCourse) {
                        onDataChange({
                          ...data,
                          course: selectedCourse.label,
                          courseDegreeType: selectedCourse.degreeType,
                          isVerified: false,
                          verificationResult: null,
                        });
                      }
                      if (errors.course) {
                        setErrors({ ...errors, course: undefined });
                      }
                    }}
                    required
                    className={`w-full px-3 py-2.5 rounded-lg border ${
                      errors.course ? "border-red-500" : "border-gray-200"
                    } focus:border-emerald-500 outline-none transition-colors text-sm text-gray-800`}
                  >
                    <option value="">-- Select a program --</option>
                    {defaultCourses.map((course) => (
                      <option key={course.value} value={course.label}>
                        {course.label}
                      </option>
                    ))}
                  </select>
                )}

                {errors.course && (
                  <p className="text-red-500 text-xs">{errors.course}</p>
                )}
              </div>
            </div>
          )
          }
        </div>
      )}

      {/* Step 3: Fees - Single Column Layout */}
      {data.course && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-1 gap-4">
          {/* Offer Letter Upload - COMMENTED OUT
          <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                  <FileCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Upload Offer Letter
                    <span className="text-red-500 ml-1">*</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    University acceptance letter
                  </p>
                </div>
              </div>
              <Tooltip content="Upload your official admission offer letter. PDF format, max 5MB.">
                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </Tooltip>
            </div>

            <FileUpload
              label=""
              name="offerLetter"
              accept=".pdf"
              description="PDF format only (max 5MB)"
              onFileChange={handleFileChange}
            />
            {errors.offerLetter && (
              <p className="text-red-500 text-xs mt-2">{errors.offerLetter}</p>
            )}
          </div>
          */}

          {/* Fees Input */}
          <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
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
                  <p className="text-xs text-gray-500">Program fees in USD</p>
                </div>
              </div>
              <Tooltip content="Enter the total tuition/fees as mentioned in your offer letter. A 10% tolerance is allowed for variations.">
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
                  className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-gray-200 focus:border-amber-500 outline-none transition-colors text-sm text-gray-800 placeholder:text-gray-400"
                />
              </div>

              {errors.totalFees && (
                <p className="text-red-500 text-xs">{errors.totalFees}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Declarations Section */}
      {data.course && data.totalFees && (
        <div className="mb-4 p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 mb-4">
            <CheckSquare className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-semibold text-gray-800">
              Declarations
              <span className="text-red-500 ml-1">*</span>
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={data.noPreviousScholarship}
                onChange={(e) =>
                  onDataChange({
                    ...data,
                    noPreviousScholarship: e.target.checked,
                  })
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

            <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={data.courseFullTimeEligible}
                onChange={(e) =>
                  onDataChange({
                    ...data,
                    courseFullTimeEligible: e.target.checked,
                  })
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
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          disabled={isApplicationSubmitted}
          className="group flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isDownloadingPDF || isApplicationSubmitted}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

          {isApplicationSubmitted ? (
            <div className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md">
              <CheckCircle2 className="w-4 h-4" />
              Already Submitted
            </div>
          ) : (
            // <button
            //   type="submit"
            //   disabled={!canSubmit}
            //   className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
            //     canSubmit
            //       ? result?.status === "accepted"
            //         ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg"
            //         : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg"
            //       : "bg-gray-200 text-gray-400 cursor-not-allowed"
            //   }`}
            // >
            //   <CheckCircle2 className="w-4 h-4" />
            //   {result?.status === "accepted"
            //     ? "Submit Application"
            //     : "Submit for Manual Review"}
            // </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              Submit Application
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
