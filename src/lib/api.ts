const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export interface University {
  id: number;
  name: string;
  country: string;
  city?: string;
  rank?: number;
  overall_score?: number;
}

export interface UniversitiesResponse {
  universities: University[];
  total: number;
}

// ============== Course Scraping Types ==============

export interface ScrapedCourse {
  name: string;
  degree_type: string | null;
  fee: number | null;
  fee_period: string | null;
  duration: string | null;
}

export interface ScrapeCoursesRequest {
  university_id: number;
  fees_page_url: string;
}

export interface ScrapeCoursesResponse {
  success: boolean;
  university_name: string;
  page_title: string | null;
  courses: ScrapedCourse[];
  message: string;
  raw_content_preview: string | null;
}

// ============== Fee Verification Types ==============

export interface FeeVerificationRequest {
  university_id: number;
  course_name: string;
  user_fees: number;
  fees_page_url: string;
}

export interface FeeItem {
  field: string;
  amount: number;
  amount_inr: number;
}

export interface FeeVerificationDetails {
  fee_breakdown: FeeItem[];
  page_title?: string | null;
  extraction_method: string;
  confidence: string;
  llm_notes?: string | null;
  tolerance_percent: number;
  usd_to_inr_rate: number;
  fees_found_count: number;

  // ✅ NEW — REQUIRED
  target_course_fees_found?: number | null;
  target_course?: string | null;
  scraping_error?: string | null;
}

export interface FeeVerificationResponse {
  status: "accepted" | "rejected";
  university_name: string;
  course_name: string;
  user_input_fees: number;
  user_input_fees_inr: number;
  scraped_fees: number | null;
  scraped_fees_inr: number | null;
  matched_field: string | null;
  scraping_successful: boolean;
  message: string;
  details: FeeVerificationDetails;
}

// ============== Document Verification Types ==============

export interface VerificationResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  is_eligible?: boolean | null;
}

export interface OfferLetterVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    s3_key?: string;
    university_verification?: {
      match_reason?: string;
      matched?: boolean;
    };
    [key: string]: any;
  };
  is_eligible?: boolean | null;
}

// ============== API Functions ==============

export async function fetchUniversities(
  search?: string,
  country?: string,
  limit?: number
): Promise<UniversitiesResponse> {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (country) params.append("country", country);
    if (limit) params.append("limit", limit.toString());

    const url = `${API_BASE_URL}/api/universities${
      params.toString() ? "?" + params.toString() : ""
    }`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching universities:", error);
    return { universities: [], total: 0 };
  }
}

export async function getUniversity(id: number): Promise<University | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/universities/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching university:", error);
    return null;
  }
}

export async function scrapeCourses(
  request: ScrapeCoursesRequest
): Promise<ScrapeCoursesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/scrape-courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
}

export async function verifyFees(
  request: FeeVerificationRequest
): Promise<FeeVerificationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/verify-fees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
}

export async function checkLLMStatus(): Promise<{
  ollama_running: boolean;
  model_available: boolean;
  available_models?: string[];
  required_model?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/llm-status`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    return {
      ollama_running: false,
      model_available: false,
      error:
        error instanceof Error ? error.message : "Failed to check LLM status",
    };
  }
}

// ============== Document Verification Functions ==============

export async function verifyForm16(file: File): Promise<VerificationResponse> {
  const formData = new FormData();
  formData.append("document", file);

  try {
    const response = await fetch(`${API_BASE_URL}/api/verify/form16`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Form 16 verification error:", error);
    return {
      success: false,
      message: "Failed to connect to verification service. Please try again.",
      is_eligible: null,
    };
  }
}

export async function verifyCasteCertificate(
  file: File,
  firstName: string,
  lastName: string
): Promise<VerificationResponse> {
  const formData = new FormData();
  formData.append("document", file);
  formData.append("first_name", firstName);
  formData.append("last_name", lastName);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/verify/caste-certificate`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Caste certificate verification error:", error);
    return {
      success: false,
      message: "Failed to connect to verification service. Please try again.",
      is_eligible: null,
    };
  }
}

export async function verifyMarksheet(
  file: File,
  type: "10th" | "12th" | "graduation",
  firstName?: string,
  lastName?: string
): Promise<VerificationResponse> {
  const formData = new FormData();
  formData.append("document", file);
  formData.append("marksheet_type", type);
  if (firstName) formData.append("first_name", firstName);
  if (lastName) formData.append("last_name", lastName);

  try {
    const response = await fetch(`${API_BASE_URL}/api/verify/marksheet`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Marksheet verification error:", error);
    return {
      success: false,
      message: "Failed to verify marksheet. Please try again.",
      is_eligible: null,
    };
  }
}

export async function uploadMarksheet(
  file: File,
  type: "10th" | "12th" | "graduation"
): Promise<VerificationResponse> {
  const formData = new FormData();
  formData.append("document", file);
  formData.append("marksheet_type", type);

  try {
    const response = await fetch(`${API_BASE_URL}/api/upload/marksheet`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Marksheet upload error:", error);
    return {
      success: false,
      message: "Failed to upload marksheet. Please try again.",
      is_eligible: null,
    };
  }
}
export interface AuthUser {
  id: number;
  email: string;
  phone: string | null;
  username: string | null;
  full_name: string | null;
  aadhar_verified: boolean;
  pan_verified: boolean;
  kyc_completed: boolean;
  created_at: string | null;
  last_login: string | null;
}

export interface AuthResponse {
  success: boolean;
  message:
    | string
    | {
        msg?: string;
        type?: string;
        loc?: string[];
        input?: unknown;
        url?: string;
      };
  user?: AuthUser;
  token?: string;
}

export interface RegisterRequest {
  email: string;
  phone?: string;
  password: string;
  username?: string;
  type?: string;
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

// ============== Application Types ==============

export interface ApplicationData {
  id: number;
  user_id: string;
  application_id: string;
  current_step: number;
  
  aadhaar_number: string | null;
  aadhaar_verified: boolean;
  pan_number: string | null;
  pan_verified: boolean;

  full_name: string | null;
  father_name: string | null;
  mother_name: string | null;
  marital_status: string | null;
  dob_day: string | null;
  dob_month: string | null;
  dob_year: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  mother_tongue: string | null;
  permanent_mark1: string | null;
  permanent_mark2: string | null;
  tribe: string | null;
  st_certificate_number: string | null;
  certificate_issue_date: string | null;
  caste_validity_cert_number: string | null;
  caste_validity_issue_date: string | null;
  
  application_status: string;
  submitted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_submitted?: boolean;
  category?: string | null
}

export interface ApplicationResponse {
  success: boolean;
  message: string;
  data?: ApplicationData;
}

// ============== Auth Token Management ==============

const AUTH_TOKEN_KEY = "enroll_iq_token";
const AUTH_USER_KEY = "enroll_iq_user";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem(AUTH_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

export function setStoredUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ============== Auth API Functions ==============

export async function register(
  request: RegisterRequest
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
        ...request,
        type: request.type || "student"  // ✅ Add default type
      }),
      
    });

    const data = await response.json();

    if (!response.ok) {
      // ✅ FIXED: Ensure message is always a string
      const errorMsg =
        typeof data.detail === "string"
          ? data.detail
          : data.detail?.msg || "Registration failed";
      return { success: false, message: errorMsg };
    }

    // Store token and user
    if (data.token) setAuthToken(data.token);
    if (data.user) setStoredUser(data.user);

    return data;
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "Failed to connect to server" };
  }
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      // ✅ FIXED: Ensure message is always a string
      const errorMsg =
        typeof data.detail === "string"
          ? data.detail
          : data.detail?.msg || "Login failed";
      return { success: false, message: errorMsg };
    }

    // Store token and user
    if (data.token) setAuthToken(data.token);
    if (data.user) setStoredUser(data.user);

    return data;
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Failed to connect to server" };
  }
}

export async function logout(): Promise<AuthResponse> {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
  } catch (error) {
    console.error("Logout error:", error);
  }

  clearAuthToken();
  return { success: true, message: "Logged out" };
}

export async function getCurrentUser(): Promise<AuthResponse> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      clearAuthToken();
      return { success: false, message: data.detail || "Session expired" };
    }

    if (data.user) setStoredUser(data.user);
    return data;
  } catch (error) {
    console.error("Get user error:", error);
    return { success: false, message: "Failed to connect to server" };
  }
}

export async function verifyAadhar(
  aadharNumber: string,
  otp: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-aadhar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ aadhar_number: aadharNumber, otp }),
    });

    const data = await response.json();
    if (data.user) setStoredUser(data.user);
    return data;
  } catch (error) {
    console.error("Aadhar verification error:", error);
    return { success: false, message: "Failed to verify Aadhar" };
  }
}

export async function verifyPan(panNumber: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-pan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ pan_number: panNumber }),
    });

    const data = await response.json();
    if (data.user) setStoredUser(data.user);
    return data;
  } catch (error) {
    console.error("PAN verification error:", error);
    return { success: false, message: "Failed to verify PAN" };
  }
}

export async function completeKyc(): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/complete-kyc`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (data.user) setStoredUser(data.user);
    return data;
  } catch (error) {
    console.error("KYC completion error:", error);
    return { success: false, message: "Failed to complete KYC" };
  }
}

// ============== Application API Functions ==============

export async function getApplication(): Promise<ApplicationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/application/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
      return {
        success: false,
        message: data.detail || "Failed to load application",
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Get application error:", error);
    return { success: false, message: "Failed to connect to server" };
  }
}

export async function updatePersonalDetails(
  data: {
    full_name?: string;
    father_name?: string;
    mother_name?: string;
    marital_status?: string;
    dob_day?: string;
    dob_month?: string;
    dob_year?: string;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
    email?: string;
    mother_tongue?: string;
    permanent_mark1?: string;
    permanent_mark2?: string;
    tribe?: string;
    st_certificate_number?: string;
    certificate_issue_date?: string;
    caste_validity_cert_number?: string;
    caste_validity_issue_date?: string;
  }
): Promise<ApplicationResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/application/personal-details`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Update personal details error:", error);
    return { success: false, message: "Failed to save personal details" };
  }
}

export async function updateDocuments(
  data: Record<string, unknown>
): Promise<ApplicationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/application/documents`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    console.error("Update documents error:", error);
    return { success: false, message: "Failed to save documents" };
  }
}

export async function updateUniversityDetails(
  data: {
    university_id?: number;
    university_name?: string;
    university_country?: string;
    university_rank?: number;
    course_name?: string;
    course_degree_type?: string;
    total_fees_usd?: number;
    total_fees_inr?: number;
    fees_page_url?: string;
    fees_verified?: boolean;
    fees_verification_status?: string;
    offer_letter_file?: string;
  }
): Promise<ApplicationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/application/university`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    console.error("Update university details error:", error);
    return { success: false, message: "Failed to save university details" };
  }
}

/**
 * Update university details with file upload (offer letter)
 */
export async function updateUniversityDetailsWithFile(
  data: {
    application_id: string;
    course_name: string;
    course_field?: string;
    total_fees_usd: number;
    university_rank?: number;
    fees_page_url: string;
    no_previous_scholarship: boolean;
    course_full_time_eligible: boolean;
  },
  offerLetterFile?: File
): Promise<ApplicationResponse> {
  try {
    const formData = new FormData();
    
    // Add application ID
    formData.append("application_id", data.application_id);
    
    // Add required form fields
    formData.append("course_type", data.course_name);
    formData.append("course_field", data.course_field || "");
    formData.append("total_fees_usd", data.total_fees_usd.toString());
    formData.append("fees_page_url", data.fees_page_url);
    
    // Add declarations
    formData.append("no_previous_scholarship", data.no_previous_scholarship.toString());
    formData.append("course_full_time_eligible", data.course_full_time_eligible.toString());
    
    if (data.university_rank) {
      formData.append("university_rank", data.university_rank.toString());
    }
    
    // Add offer letter file if present
    if (offerLetterFile) {
      formData.append("offer_letter", offerLetterFile);
    }

    const response = await fetch(
      `${API_BASE_URL}/api/application/update-university-details`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Update university details with file error:", error);
    return {
      success: false,
      message: "Failed to save university details. Please try again.",
    };
  }
}

export async function updateApplicationStep(
  step: number
): Promise<ApplicationResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/application/step?step=${step}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Update step error:", error);
    return { success: false, message: "Failed to update step" };
  }
}

export async function submitApplication(): Promise<ApplicationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/application/submit`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    return await response.json();
  } catch (error) {
    console.error("Submit application error:", error);
    return { success: false, message: "Failed to submit application" };
  }
}

export async function resetApplication(): Promise<ApplicationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/application/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    return await response.json();
  } catch (error) {
    console.error("Reset application error:", error);
    return { success: false, message: "Failed to reset application" };
  }
}

export async function loadSavedPersonalDetails(): Promise<{
  success: boolean;
  data?: any;
  message?: string;
}> {
  try {
    const token = localStorage.getItem('enroll_iq_token');
    if (!token) {
      return { success: false, message: 'Not authenticated' };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/application/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (response.ok && result.success && result.data) {
      // Convert backend field names to frontend field names
      const backendData = result.data;
      const frontendData = {
        fullName: backendData.full_name || '',
        fatherName: backendData.father_name || '',
        motherName: backendData.mother_name || '',
        maritalStatus: backendData.marital_status || '',
        dobYear: backendData.dob_year || '',
        dobMonth: backendData.dob_month || '',
        dobDay: backendData.dob_day || '',
        gender: backendData.gender || '',
        aadhaarNumber: backendData.aadhaar_number || '',
        motherTongue: backendData.mother_tongue || '',
        permanentMark1: backendData.permanent_mark1 || '',
        permanentMark2: backendData.permanent_mark2 || '',
        tribe: backendData.tribe || '',
        stCertificateNumber: backendData.st_certificate_number || '',
        certificateIssueDate: backendData.certificate_issue_date || '',
        casteValidityCertNumber: backendData.caste_validity_cert_number || '',
        casteValidityIssueDate: backendData.caste_validity_issue_date || '',
        address: backendData.address || '',
        city: backendData.city || '',
        state: backendData.state || '',
        pincode: backendData.pincode || '',
        phone: backendData.phone || '',
        email: backendData.email || '',
      };

      return {
        success: true,
        data: {
          personalDetails: frontendData,
          currentStep: backendData.current_step || 1,
          applicationStatus: backendData.application_status || 'draft',
          applicationId: backendData.application_id,
        },
      };
    }

    return { success: false, message: result.message || 'Failed to load data' };
  } catch (error) {
    console.error('Error loading saved details:', error);
    return { success: false, message: 'Failed to connect to server' };
  }
}

export async function updateAadharPanVerification(data: {
  aadhaar_number: string;
  aadhaar_verified: boolean;
  pan_number: string;
  pan_verified: boolean;
  // Add root-level fields (matching your database structure)
  full_name?: string;
  father_name?: string;
  dob_day?: string;
  dob_month?: string;
  dob_year?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
}): Promise<ApplicationResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/application/verification`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Verification update error:", error);
    return { success: false, message: "Failed to update verification" };
  }
}

// ============== S3 Upload Types ==============

export interface S3UploadResponse {
  success: boolean;
  message: string;
  data?: {
    s3Key: string;
    s3Url: string;
    fileName: string;
    fileSize: number;
    contentType: string;
    uniqueIdentifier?: string;
  };
}

export interface S3FileExistsResponse {
  success: boolean;
  exists: boolean;
  message?: string;
  data?: {
    s3Key: string;
    s3Url: string;
  };
}

// ============== S3 Upload Functions ==============

/**
 * Generic function to upload files to S3
 * @param file - The file to upload
 * @param path - S3 path prefix (e.g., "enroll_iq_files/submission_files/{applicationId}/KYC/")
 * @param options - Optional parameters
 * @returns Upload response with S3 key and URL
 */
export async function uploadToS3(
  file: File,
  path: string,
  options?: {
    applicationId?: string;
    fileName?: string;
  }
): Promise<S3UploadResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);
    
    if (options?.applicationId) {
      formData.append("applicationId", options.applicationId);
    }
    
    if (options?.fileName) {
      formData.append("fileName", options.fileName);
    }

    const response = await fetch("/api/upload-s3", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to upload file to S3");
    }

    return result;
  } catch (error) {
    console.error("S3 upload error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to upload file to S3",
    };
  }
}

/**
 * Check if a file exists in S3
 * @param path - S3 path (e.g., "enroll_iq_files/submission_files/{applicationId}/documents/form16.pdf")
 * @param options - Optional parameters
 * @returns Response indicating if file exists
 */
export async function checkS3FileExists(
  path: string,
  options?: {
    applicationId?: string;
    fileName?: string;
  }
): Promise<S3FileExistsResponse> {
  try {
    const params = new URLSearchParams();
    params.append("path", path);
    
    if (options?.applicationId) {
      params.append("applicationId", options.applicationId);
    }
    
    if (options?.fileName) {
      params.append("fileName", options.fileName);
    }

    const response = await fetch(`/api/check-s3-file?${params.toString()}`);

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to check file existence");
    }

    return result;
  } catch (error) {
    console.error("S3 check error:", error);
    return {
      success: false,
      exists: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to check file existence",
    };
  }
}

export interface S3DocumentsStatusResponse {
  success: boolean;
  message?: string;
  data?: Record<string, {
    exists: boolean;
    s3Key?: string;
    s3Url?: string;
  }>;
}

/**
 * Check status of all documents for an application
 * @param applicationId - Application ID
 * @returns Status of all documents (form16, caste, marksheet10th, marksheet12th, graduation)
 */
export async function checkS3DocumentsStatus(
  applicationId: string
): Promise<S3DocumentsStatusResponse> {
  try {
    const params = new URLSearchParams();
    params.append("applicationId", applicationId);

    const response = await fetch(`/api/check-s3-documents?${params.toString()}`);

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to check documents status");
    }

    return result;
  } catch (error) {
    console.error("S3 documents check error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to check documents status",
    };
  }
}

// ============== Document Verification Types ==============

export interface VerifySingleDocumentRequest {
  application_id: string;
  document_type: "form16" | "caste_certificate" | "marksheet_10th" | "marksheet_12th" | "marksheet_graduation";
}

export interface VerifySingleDocumentResponse {
  success: boolean;
  application_id: string;
  document_type: string;
  verified: boolean;
  result?: Record<string, any>;
}

/**
 * Verify a single document after it has been uploaded to S3
 * @param applicationId - Application ID
 * @param documentType - Type of document to verify
 * @returns Verification result
 */
export async function verifySingleDocument(
  applicationId: string,
  documentType: "form16" | "caste_certificate" | "marksheet_10th" | "marksheet_12th" | "marksheet_graduation"
): Promise<VerifySingleDocumentResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/grantor/applications/verify-single-document`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        application_id: applicationId,
        document_type: documentType,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || result.message || "Verification failed");
    }

    return result;
  } catch (error) {
    console.error("Document verification error:", error);
    return {
      success: false,
      application_id: applicationId,
      document_type: documentType,
      verified: false,
      result: {
        error: error instanceof Error ? error.message : "Verification failed",
      },
    };
  }
}

// ============== Validation Result Types ==============

export interface GetValidationResultRequest {
  application_id: string;
}

export interface ValidationResultDocument {
  success: boolean;
  message: string;
  data?: any;
  is_eligible: boolean;
}

export interface ValidationResult {
  success: boolean;
  message: string;
  application_id: string;
  verification_results: {
    form16?: ValidationResultDocument;
    caste_certificate?: ValidationResultDocument;
    marksheet_10th?: ValidationResultDocument;
    marksheet_12th?: ValidationResultDocument;
    marksheet_graduation?: ValidationResultDocument;
    offer_letter?: ValidationResultDocument;
  };
}

export interface GetValidationResultResponse {
  success: boolean;
  message: string;
  validation_result: ValidationResult | null;
}

/**
 * Get validation results for all documents by application ID
 * @param applicationId - Application ID
 * @returns Validation results for all documents
 */
export async function getValidationResultByApplicationId(
  applicationId: string
): Promise<GetValidationResultResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/grantor/applications/get-validation-result-by-application-id`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          application_id: applicationId,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.detail || result.message || "Failed to get validation results"
      );
    }

    return result;
  } catch (error) {
    console.error("Get validation result error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to get validation results",
      validation_result: null,
    };
  }
}

/**
 * Verify offer letter with OCR + LLM + university cross-checking
 * @param file - The offer letter file to verify
 * @param universityName - Optional university name for cross-checking
 * @returns Verification response with eligibility status
 */
export async function verifyOfferLetter(
  file: File,
  universityName?: string
): Promise<OfferLetterVerificationResponse> {
  try {
    const formData = new FormData();
    formData.append("document", file);
    
    if (universityName) {
      formData.append("university_name", universityName);
    }

    const response = await fetch(`${API_BASE_URL}/api/verify/offer-letter`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.detail || result.message || "Offer letter verification failed"
      );
    }

    return result;
  } catch (error) {
    console.error("Offer letter verification error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to verify offer letter",
      is_eligible: null,
    };
  }
}

export async function updateApplicationCategory(
  applicationId: string,
  category: string
): Promise<{ success: boolean; message: string; category?: string }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/grantor/applications/${applicationId}/category`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update category");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
}

export async function updateIncomeDetails(
  applicationId: string,
  incomeDetails: Record<string, any>
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/grantor/applications/${applicationId}/income-details`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ income_details: incomeDetails }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update income details");
  }

  return response.json();
}