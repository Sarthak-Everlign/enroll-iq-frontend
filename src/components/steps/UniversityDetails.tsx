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
} from "lucide-react";
import {
  fetchUniversities,
  scrapeCourses,
  verifyFees,
  submitApplication,
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
  personalData?: any;  // NEW
  documentsData?: any; // NEW
  isApplicationSubmitted?: boolean; 
  onSubmissionSuccess?: () => void;  
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
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap max-w-xs text-center">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

// Default courses fallback
const defaultCourses = [
  {
    value: "mba",
    label: "Master of Business Administration (MBA)",
    degreeType: "MBA",
  },
  {
    value: "ms_cs",
    label: "Master of Science in Computer Science",
    degreeType: "Master's",
  },
  {
    value: "ms_ds",
    label: "Master of Science in Data Science",
    degreeType: "Master's",
  },
  {
    value: "ms_eng",
    label: "Master of Science in Engineering",
    degreeType: "Master's",
  },
  { value: "llm", label: "Master of Laws (LL.M.)", degreeType: "LL.M." },
  { value: "ma", label: "Master of Arts (MA)", degreeType: "Master's" },
  { value: "msc", label: "Master of Science (MSc)", degreeType: "Master's" },
  { value: "mph", label: "Master of Public Health (MPH)", degreeType: "MPH" },
  { value: "mba_exec", label: "Executive MBA", degreeType: "MBA" },
  { value: "phd", label: "Doctor of Philosophy (PhD)", degreeType: "PhD" },
];

export default function UniversityDetails({
  onBack,
  data,
  onDataChange,
  personalData,
  documentsData,
  isApplicationSubmitted,
  onSubmissionSuccess,
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
      dob: personalData?.dobYear && personalData?.dobMonth && personalData?.dobDay
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
        graduationMarksheet: documentsData?.graduationMarksheet ? true : false,
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
      alert("This application has already been submitted and cannot be resubmitted.");
      return;
    }

    if (!canSubmit) {
      return;
    }

    try {
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
      <div className="flex items-center gap-3 mb-8">
        <div className="h-8 w-1.5 bg-gradient-to-b from-red-500 to-pink-500 rounded-full" />
        <h2 className="text-2xl font-bold text-gray-800">University Details</h2>
      </div>

      {/* Step 1: University Selection Card */}
      <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-gray-100 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                Step 1: Select Your University
              </h3>
              <p className="text-sm text-gray-500">
                Choose from 200 partner universities worldwide
              </p>
            </div>
          </div>
          <Tooltip content="Select the university where you have received admission. We partner with 200+ universities globally.">
            <HelpCircle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </Tooltip>
        </div>

        {loadingUniversities ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200">
            <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
            <span className="text-gray-600">Loading universities...</span>
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

        {selectedUniversity && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-base text-purple-800 font-semibold">
                  {selectedUniversity.name}
                </p>
                <p className="text-sm text-purple-600 mt-1">
                  {selectedUniversity.city ? `${selectedUniversity.city}, ` : ''}{selectedUniversity.country}
                </p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-purple-500 flex-shrink-0" />
            </div>
            
            {/* Rank and Score Display */}
            {(selectedUniversity.rank || selectedUniversity.overall_score) && (
              <div className="mt-3 pt-3 border-t border-purple-200 flex items-center gap-4">
                {selectedUniversity.rank && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">#{selectedUniversity.rank}</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">QS World Rank</p>
                      <p className="text-sm font-semibold text-gray-800">#{selectedUniversity.rank}</p>
                    </div>
                  </div>
                )}
                {selectedUniversity.overall_score && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Overall Score</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedUniversity.overall_score}/100</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Fees Page URL */}
      {data.universityId && (
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Step 2: Official Fees Page URL
                </h3>
                <p className="text-sm text-gray-500">
                  Provide the university's official tuition/fees page
                </p>
              </div>
            </div>
            <Tooltip content="Enter the official university webpage that lists tuition fees. This should be from the university's official website (e.g., .edu domain). We'll extract available programs and fees from this page.">
              <HelpCircle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </Tooltip>
          </div>

          <div className="space-y-4">
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

            <div className="flex items-center gap-3">
              {data.feesPageUrl && (
                <a
                  href={data.feesPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Preview URL
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={handleScrapeCourses}
              disabled={isScrapingCourses || !data.feesPageUrl}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                isScrapingCourses
                  ? "bg-gray-200 text-gray-500 cursor-wait"
                  : hasCourses
                  ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                  : "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
              }`}
            >
              {isScrapingCourses ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Scanning for Courses...
                </>
              ) : hasCourses ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  {scrapedCourses.length} Courses Found - Rescan
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Scan for Available Courses
                </>
              )}
            </button>

            {coursesScrapeResult && !coursesScrapeResult.success && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">
                  {coursesScrapeResult.message}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Course Selection */}
      {data.universityId &&
        data.feesPageUrl &&
        (hasCourses || showManualCourse) && (
          <div className="mb-6 p-6 rounded-2xl bg-white border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Step 3: Select Your Course/Program
                  </h3>
                  <p className="text-sm text-gray-500">
                    {hasCourses
                      ? `${scrapedCourses.length} programs found`
                      : "Select from common programs"}
                  </p>
                </div>
              </div>
              <Tooltip content="Select the specific program you're enrolled in. Fees will be verified specifically for this program. If your program isn't listed, you can choose from common programs.">
                <HelpCircle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </Tooltip>
            </div>

            {/* Scraped Courses */}
            {hasCourses && (
              <div className="space-y-2 mb-4 max-h-96 overflow-y-auto pr-2">
                {scrapedCourses.map((course, index) => {
                  const courseName = course.degree_type
                    ? `${course.degree_type} - ${course.name}`
                    : course.name;
                  const isSelected = data.course === courseName;
                  const hasFee = course.fee !== null;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleCourseSelect(course)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50 shadow-md"
                          : hasFee
                          ? "border-blue-200 hover:border-blue-300 bg-blue-50/50 hover:bg-blue-50"
                          : "border-gray-100 hover:border-gray-200 bg-gray-50 hover:bg-white"
                      }`}
                    >
                      {/* Fee indicator badge */}
                      {hasFee && !isSelected && (
                        <div className="flex items-center gap-1 mb-2">
                          <Sparkles className="w-3 h-3 text-blue-500" />
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500 text-white font-medium">
                            Fee Available
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p
                            className={`font-medium ${
                              isSelected ? "text-emerald-700" : "text-gray-800"
                            }`}
                          >
                            {course.name}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            {course.degree_type && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  isSelected
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-purple-100 text-purple-700"
                                }`}
                              >
                                {course.degree_type}
                              </span>
                            )}
                            {course.duration && (
                              <span className="text-xs text-gray-500">
                                {course.duration}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          {course.fee && (
                            <div>
                              <p
                                className={`font-semibold text-base ${
                                  isSelected
                                    ? "text-emerald-600"
                                    : "text-gray-700"
                                }`}
                              >
                                ${course.fee.toLocaleString()}
                              </p>
                              {course.fee_period && (
                                <p className="text-xs text-gray-500">
                                  {course.fee_period}
                                </p>
                              )}
                            </div>
                          )}
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 ml-auto" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Manual Course Selection Toggle */}
            {hasCourses && (
              <button
                type="button"
                onClick={() => setShowManualCourse(!showManualCourse)}
                className="text-sm text-violet-600 hover:text-violet-700 font-medium mb-4"
              >
                {showManualCourse
                  ? "↑ Hide manual selection"
                  : "↓ Program not listed? Select manually"}
              </button>
            )}

            {/* Manual Course Dropdown */}
            {showManualCourse && (
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select from common programs:
                </label>
                <select
                  value=""
                  onChange={handleManualCourseSelect}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 outline-none transition-colors text-gray-800"
                >
                  <option value="">-- Select a program --</option>
                  {defaultCourses.map((course) => (
                    <option key={course.value} value={course.value}>
                      {course.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Selected Course Display */}
            {data.course && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700 uppercase">
                        Selected Program
                      </span>
                    </div>
                    <p className="text-sm font-medium text-emerald-800">
                      {data.course}
                    </p>
                    {data.courseDegreeType && (
                      <p className="text-xs text-emerald-600 mt-1">
                        {data.courseDegreeType}
                      </p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            )}

            {errors.course && (
              <p className="text-red-500 text-sm mt-2">{errors.course}</p>
            )}
          </div>
        )}

      {/* Step 4: Offer Letter Upload */}
      {data.course && (
        <div className="mb-6 p-6 rounded-2xl bg-white border-2 border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Step 4: Upload Offer Letter
                </h3>
                <p className="text-sm text-gray-500">
                  Upload your university acceptance/offer letter
                </p>
              </div>
            </div>
            <Tooltip content="Upload your official admission offer letter from the university. This document confirms your acceptance and helps verify your enrollment. Accepted format: PDF (max 5MB).">
              <HelpCircle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </Tooltip>
          </div>

          <FileUpload
            label=""
            name="offerLetter"
            accept=".pdf"
            description="PDF format only (max 5MB)"
            onFileChange={handleFileChange}
          />

          {data.offerLetter && (
            <div className="mt-3 p-3 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-700">
                  {data.offerLetter.name}
                </p>
                <p className="text-xs text-pink-500">
                  {(data.offerLetter.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-pink-500" />
            </div>
          )}
        </div>
      )}

      {/* Step 5: Fees & Verification */}
      {data.course && (
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Step 5: Enter & Verify Fees
                </h3>
                <p className="text-sm text-gray-500">
                  Enter your total program fees in USD
                </p>
              </div>
            </div>
            <Tooltip content="Enter the total tuition/fees as mentioned in your offer letter. Our AI will verify this against the official university fees page specifically for your selected program. A 10% tolerance is allowed for variations.">
              <HelpCircle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </Tooltip>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                $
              </span>
              <input
                type="text"
                name="totalFees"
                placeholder="Enter total fees in USD"
                value={data.totalFees}
                onChange={handleFeesChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 outline-none transition-colors text-gray-800 placeholder:text-gray-400"
              />
            </div>

            {data.totalFees && (
              <p className="text-sm text-gray-500">
                ${parseFloat(data.totalFees).toLocaleString()} USD
                <span className="text-gray-400 ml-2">
                  (₹{(parseFloat(data.totalFees) * 83).toLocaleString("en-IN")}{" "}
                  INR)
                </span>
              </p>
            )}
            {errors.totalFees && (
              <p className="text-red-500 text-sm">{errors.totalFees}</p>
            )}

            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying || !data.totalFees}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                result?.status === "accepted"
                  ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                  : result?.status === "rejected"
                  ? "bg-gradient-to-r from-red-400 to-rose-500 text-white hover:from-red-500 hover:to-rose-600"
                  : isVerifying
                  ? "bg-gray-200 text-gray-500 cursor-wait"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl"
              }`}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI Verifying Fees for {data.course}...
                </>
              ) : result?.status === "accepted" ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  VERIFIED ✓
                </>
              ) : result?.status === "rejected" ? (
                <>
                  <XCircle className="w-5 h-5" />
                  MISMATCH - Re-verify
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Verify Fees with AI
                </>
              )}
            </button>
          </div>

          {/* Verification Result Display */}
          {result && (
            <div
              className={`mt-4 p-4 rounded-xl border ${
                result.status === "accepted"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                {result.status === "accepted" ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
                <div>
                  <p
                    className={`font-semibold ${
                      result.status === "accepted"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {result.status.toUpperCase()}
                  </p>
                  <p
                    className={`text-sm ${
                      result.status === "accepted"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {result.message}
                  </p>
                </div>
              </div>

              {/* Fee Comparison */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 rounded-lg bg-white/50">
                  <p className="text-xs text-gray-500 uppercase">Your Input</p>
                  <p className="text-lg font-semibold text-blue-600">
                    ${result.user_input_fees.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    ₹{result.user_input_fees_inr.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white/50">
                  <p className="text-xs text-gray-500 uppercase">
                    {result.matched_field ? "Matched Fee" : "Closest Fee"}
                  </p>
                  <p className="text-lg font-semibold text-purple-600">
                    {result.scraped_fees
                      ? `${result.scraped_fees.toLocaleString()}`
                      : "N/A"}
                  </p>
                  {result.scraped_fees_inr && (
                    <p className="text-xs text-gray-400">
                      ₹{result.scraped_fees_inr.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              </div>

              {/* Fee Breakdown Table - With Target Course Highlighting */}
              {result.details.fee_breakdown &&
                result.details.fee_breakdown.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-amber-500" />
                        <p className="text-sm font-semibold text-gray-700">
                          Fee Structure for {data.course}
                        </p>
                      </div>
                      <Tooltip content="These fees are extracted from the official university page using AI. Blue rows are fees specifically for your selected program. Green highlight shows the matched fee (within 10% tolerance).">
                        <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                      </Tooltip>
                    </div>
                    <div className="rounded-lg bg-white/80 overflow-hidden border border-gray-200">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left p-3 text-xs font-semibold text-gray-600">
                              Fee Type
                            </th>
                            <th className="text-right p-3 text-xs font-semibold text-gray-600">
                              USD
                            </th>
                            <th className="text-right p-3 text-xs font-semibold text-gray-600">
                              INR
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.details.fee_breakdown.map(
                            (item: FeeItem, index: number) => {
                              const isMatched =
                                result.matched_field === item.field;
                              const isTargetCourse =
                                item.field.includes("✓ [Target Course]");

                              return (
                                <tr
                                  key={index}
                                  className={`border-b border-gray-100 last:border-0 transition-colors ${
                                    isMatched
                                      ? "bg-green-100 hover:bg-green-50"
                                      : isTargetCourse
                                      ? "bg-blue-50 hover:bg-blue-100"
                                      : "hover:bg-gray-50"
                                  }`}
                                >
                                  <td
                                    className={`p-3 ${
                                      isMatched
                                        ? "text-green-800 font-semibold"
                                        : isTargetCourse
                                        ? "text-blue-800 font-medium"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {isTargetCourse && !isMatched && (
                                        <span className="text-blue-500 text-xs">
                                          ●
                                        </span>
                                      )}
                                      {item.field}
                                      {isMatched && (
                                        <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-green-500 text-white">
                                          ✓ Match
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td
                                    className={`p-3 text-right font-mono font-semibold ${
                                      isMatched
                                        ? "text-green-700"
                                        : isTargetCourse
                                        ? "text-blue-700"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    ${item.amount.toLocaleString()}
                                  </td>
                                  <td className="p-3 text-right font-mono text-gray-500 text-xs">
                                    ₹{item.amount_inr.toLocaleString("en-IN")}
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Show count of target course fees */}
                    {typeof result.details.target_course_fees_found ===
                      "number" && (
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-gray-600">
                            {result.details.target_course_fees_found} fees for "
                            {data.course}"
                          </span>
                        </div>

                        {result.details.fees_found_count >
                          result.details.target_course_fees_found && (
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-gray-400" />
                            <span className="text-gray-500">
                              {result.details.fees_found_count -
                                result.details.target_course_fees_found}{" "}
                              other program fees
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

              {/* Extraction Status */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span
                  className={`px-2 py-1 rounded-full ${
                    result.details.extraction_method === "llm"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {result.details.extraction_method === "llm"
                    ? "🤖 AI Extracted"
                    : "📝 Pattern Matched"}
                </span>
                <span
                  className={`px-2 py-1 rounded-full ${
                    result.details.confidence === "high"
                      ? "bg-green-100 text-green-700"
                      : result.details.confidence === "medium"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {result.details.confidence === "high"
                    ? "✓ High"
                    : result.details.confidence === "medium"
                    ? "~ Medium"
                    : "? Low"}{" "}
                  Confidence
                </span>
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {result.details.fees_found_count} total fees found
                </span>
              </div>

              {/* Disclaimer */}
              <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500">
                    <strong>Disclaimer:</strong> Fee verification is performed
                    using AI-powered extraction from the official university
                    website. While we strive for accuracy, fees may vary based
                    on program specifics, academic year, or additional charges.
                    Always confirm final fees with the university's admissions
                    office.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Card */}
      {data.universityId && data.course && data.totalFees && (
        <div className={`mt-8 p-6 rounded-2xl ${
          isApplicationSubmitted
            ? "bg-gradient-to-br from-green-900 to-emerald-800 text-white"
            : "bg-gradient-to-br from-gray-900 to-slate-800 text-white"
        }`}>

          {isApplicationSubmitted && (
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-green-700">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="font-semibold text-green-300">
                This application has been submitted
              </span>
            </div>
          )}
          
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Application Summary
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-sm">University</p>
              <p className="font-medium">{selectedUniversity?.name}</p>
              <p className="text-xs text-gray-500">
                {selectedUniversity?.country}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Course/Program</p>
              <p className="font-medium">{data.course}</p>
              {data.courseDegreeType && (
                <p className="text-xs text-gray-500">{data.courseDegreeType}</p>
              )}
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Fees</p>
              <p className="font-medium">
                ${parseFloat(data.totalFees).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                ₹{(parseFloat(data.totalFees) * 83).toLocaleString("en-IN")} INR
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isApplicationSubmitted
                    ? "bg-green-400"
                    : result?.status === "accepted"
                    ? "bg-emerald-400"
                    : result?.status === "rejected"
                    ? "bg-red-400"
                    : "bg-gray-400"
                }`}
              />
              <p className="text-sm">
                {isApplicationSubmitted
                  ? "Application successfully submitted on " + (data.verificationResult?.status === "accepted" ? "automatic verification" : "manual review")
                  : result?.status === "accepted"
                  ? "Fees verified by AI - Ready to submit"
                  : result?.status === "rejected"
                  ? "Fee verification failed - Please correct and retry"
                  : "Pending fees verification"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}

<div className="mt-10 flex justify-between">
  <button
    type="button"
    onClick={onBack}
    disabled={isApplicationSubmitted}
    className="group flex items-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
    Back
  </button>

  <div className="flex items-center gap-4">
    <button
      type="button"
      onClick={handleDownloadPDF}
      disabled={isDownloadingPDF || isApplicationSubmitted}
      className="group flex items-center gap-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      {isDownloadingPDF ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="w-5 h-5" />
          Download PDF
        </>
      )}
    </button>

    {isApplicationSubmitted ? (
      <div className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
        <CheckCircle2 className="w-5 h-5" />
        Already Submitted
      </div>
    ) : (
      <button
        type="submit"
        disabled={!canSubmit}
        className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
          canSubmit
            ? result?.status === "accepted"
              ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
              : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        <CheckCircle2 className="w-5 h-5" />
        {result?.status === "accepted"
          ? "Submit Application"
          : "Submit for Manual Review"}
      </button>
    )}
  </div>
</div>
    </form>
  );
}
