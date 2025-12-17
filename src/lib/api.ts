const API_BASE_URL ='https://social-welfare-testing.everlign.ai'
export interface University {
  id: number
  name: string
  country: string
  city?: string
  rank?: number
  overall_score?: number
}

export interface UniversitiesResponse {
  universities: University[]
  total: number
}

// ============== Course Scraping Types ==============

export interface ScrapedCourse {
  name: string
  degree_type: string | null
  fee: number | null
  fee_period: string | null
  duration: string | null
}

export interface ScrapeCoursesRequest {
  university_id: number
  fees_page_url: string
}

export interface ScrapeCoursesResponse {
  success: boolean
  university_name: string
  page_title: string | null
  courses: ScrapedCourse[]
  message: string
  raw_content_preview: string | null
}

// ============== Fee Verification Types ==============

export interface FeeVerificationRequest {
  university_id: number
  course_name: string
  user_fees: number
  fees_page_url: string
}

export interface FeeItem {
  field: string
  amount: number
  amount_inr: number
}

export interface FeeVerificationDetails {
  fee_breakdown: FeeItem[]
  page_title?: string | null
  extraction_method: string
  confidence: string
  llm_notes?: string | null
  tolerance_percent: number
  usd_to_inr_rate: number
  fees_found_count: number

  // ✅ NEW — REQUIRED
  target_course_fees_found?: number | null
  target_course?: string | null
  scraping_error?: string | null
}


export interface FeeVerificationResponse {
  status: 'accepted' | 'rejected'
  university_name: string
  course_name: string
  user_input_fees: number
  user_input_fees_inr: number
  scraped_fees: number | null
  scraped_fees_inr: number | null
  matched_field: string | null
  scraping_successful: boolean
  message: string
  details: FeeVerificationDetails
}

// ============== Document Verification Types ==============

export interface VerificationResponse {
  success: boolean
  message: string
  data?: Record<string, unknown>
  is_eligible?: boolean | null
}

export interface FeeItem {
  field: string
  amount: number
  amount_inr: number
}


// ============== API Functions ==============

export async function fetchUniversities(
  search?: string,
  country?: string,
  limit?: number
): Promise<UniversitiesResponse> {
  try {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (country) params.append('country', country)
    if (limit) params.append('limit', limit.toString())

    const url = `${API_BASE_URL}/api/universities${params.toString() ? '?' + params.toString() : ''}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching universities:', error)
    return { universities: [], total: 0 }
  }
}

export async function getUniversity(id: number): Promise<University | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/universities/${id}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching university:', error)
    return null
  }
}

export async function scrapeCourses(request: ScrapeCoursesRequest): Promise<ScrapeCoursesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/scrape-courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
  }

  return await response.json()
}

export async function verifyFees(request: FeeVerificationRequest): Promise<FeeVerificationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/verify-fees`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
  }

  return await response.json()
}

export async function checkLLMStatus(): Promise<{
  ollama_running: boolean
  model_available: boolean
  available_models?: string[]
  required_model?: string
  error?: string
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/llm-status`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    return {
      ollama_running: false,
      model_available: false,
      error: error instanceof Error ? error.message : 'Failed to check LLM status',
    }
  }
}

// ============== Document Verification Functions ==============

export async function verifyForm16(file: File): Promise<VerificationResponse> {
  const formData = new FormData()
  formData.append('document', file)

  try {
    const response = await fetch(`${API_BASE_URL}/api/verify/form16`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Form 16 verification error:', error)
    return {
      success: false,
      message: 'Failed to connect to verification service. Please try again.',
      is_eligible: null,
    }
  }
}

export async function verifyCasteCertificate(
  file: File,
  firstName: string,
  lastName: string
): Promise<VerificationResponse> {
  const formData = new FormData()
  formData.append('document', file)
  formData.append('first_name', firstName)
  formData.append('last_name', lastName)

  try {
    const response = await fetch(`${API_BASE_URL}/api/verify/caste-certificate`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Caste certificate verification error:', error)
    return {
      success: false,
      message: 'Failed to connect to verification service. Please try again.',
      is_eligible: null,
    }
  }
}

export async function verifyMarksheet(
  file: File,
  type: '10th' | '12th' | 'graduation',
  firstName?: string,
  lastName?: string
): Promise<VerificationResponse> {
  const formData = new FormData()
  formData.append('document', file)
  formData.append('marksheet_type', type)
  if (firstName) formData.append('first_name', firstName)
  if (lastName) formData.append('last_name', lastName)

  try {
    const response = await fetch(`${API_BASE_URL}/api/verify/marksheet`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Marksheet verification error:', error)
    return {
      success: false,
      message: 'Failed to verify marksheet. Please try again.',
      is_eligible: null,
    }
  }
}

export async function uploadMarksheet(
  file: File,
  type: '10th' | '12th' | 'graduation'
): Promise<VerificationResponse> {
  const formData = new FormData()
  formData.append('document', file)
  formData.append('marksheet_type', type)

  try {
    const response = await fetch(`${API_BASE_URL}/api/upload/marksheet`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Marksheet upload error:', error)
    return {
      success: false,
      message: 'Failed to upload marksheet. Please try again.',
      is_eligible: null,
    }
  }
}
export interface AuthUser {
  id: number
  email: string
  phone: string | null
  username: string | null
  full_name: string | null
  aadhar_verified: boolean
  pan_verified: boolean
  kyc_completed: boolean
  created_at: string | null
  last_login: string | null
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: AuthUser
  token?: string
}

export interface RegisterRequest {
  email: string
  phone?: string
  password: string
  username?: string
}

export interface LoginRequest {
  email?: string
  phone?: string
  password: string
}

// ============== Application Types ==============

export interface ApplicationData {
  id: number
  user_id: number
  current_step: number
  personal_details: {
    full_name: string | null
    father_name: string | null
    date_of_birth: string | null
    gender: string | null
    address: string | null
    city: string | null
    state: string | null
    pincode: string | null
    phone: string | null
    email: string | null
    nationality: string | null
    category: string | null
  }
  documents: {
    marksheet_10th: {
      file: string | null
      percentage: number | null
      verified: boolean
      eligible: boolean | null
      data: Record<string, unknown> | null
    }
    marksheet_12th: {
      file: string | null
      percentage: number | null
      verified: boolean
      eligible: boolean | null
      data: Record<string, unknown> | null
    }
    graduation: {
      file: string | null
      percentage: number | null
      verified: boolean
      eligible: boolean | null
      data: Record<string, unknown> | null
    }
    form16: {
      file: string | null
      verified: boolean
      income: number | null
      eligible: boolean | null
    }
    caste_certificate: {
      file: string | null
      verified: boolean
      category: string | null
    }
  }
  university: {
    university_id: number | null
    university_name: string | null
    university_country: string | null
    university_rank: number | null
    course_name: string | null
    course_degree_type: string | null
    total_fees_usd: number | null
    total_fees_inr: number | null
    fees_page_url: string | null
    fees_verified: boolean
    fees_verification_status: string | null
    offer_letter_file: string | null
  }
  application_status: string
  submitted_at: string | null
  created_at: string | null
  updated_at: string | null
}

export interface ApplicationResponse {
  success: boolean
  message: string
  data?: ApplicationData
}

// ============== Auth Token Management ==============

const AUTH_TOKEN_KEY = 'enroll_iq_token'
const AUTH_USER_KEY = 'enroll_iq_user'

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem(AUTH_USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

export function setStoredUser(user: AuthUser): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ============== Auth API Functions ==============

export async function register(request: RegisterRequest): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })

    const data = await response.json()
    
    if (!response.ok) {
      return { success: false, message: data.detail || 'Registration failed' }
    }

    // Store token and user
    if (data.token) setAuthToken(data.token)
    if (data.user) setStoredUser(data.user)

    return data
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, message: 'Failed to connect to server' }
  }
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })

    const data = await response.json()
    
    if (!response.ok) {
      return { success: false, message: data.detail || 'Login failed' }
    }

    // Store token and user
    if (data.token) setAuthToken(data.token)
    if (data.user) setStoredUser(data.user)

    return data
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, message: 'Failed to connect to server' }
  }
}

export async function logout(): Promise<AuthResponse> {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })
  } catch (error) {
    console.error('Logout error:', error)
  }

  clearAuthToken()
  return { success: true, message: 'Logged out' }
}

export async function getCurrentUser(): Promise<AuthResponse> {
  const token = getAuthToken()
  if (!token) {
    return { success: false, message: 'Not authenticated' }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: getAuthHeaders(),
    })

    const data = await response.json()
    
    if (!response.ok) {
      clearAuthToken()
      return { success: false, message: data.detail || 'Session expired' }
    }

    if (data.user) setStoredUser(data.user)
    return data
  } catch (error) {
    console.error('Get user error:', error)
    return { success: false, message: 'Failed to connect to server' }
  }
}

export async function verifyAadhar(aadharNumber: string, otp: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-aadhar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ aadhar_number: aadharNumber, otp }),
    })

    const data = await response.json()
    if (data.user) setStoredUser(data.user)
    return data
  } catch (error) {
    console.error('Aadhar verification error:', error)
    return { success: false, message: 'Failed to verify Aadhar' }
  }
}

export async function verifyPan(panNumber: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-pan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ pan_number: panNumber }),
    })

    const data = await response.json()
    if (data.user) setStoredUser(data.user)
    return data
  } catch (error) {
    console.error('PAN verification error:', error)
    return { success: false, message: 'Failed to verify PAN' }
  }
}

export async function completeKyc(): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/complete-kyc`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })

    const data = await response.json()
    if (data.user) setStoredUser(data.user)
    return data
  } catch (error) {
    console.error('KYC completion error:', error)
    return { success: false, message: 'Failed to complete KYC' }
  }
}

// ============== Application API Functions ==============

export async function getApplication(): Promise<ApplicationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/application/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const data = await response.json()
      return { success: false, message: data.detail || 'Failed to load application' }
    }

    return await response.json()
  } catch (error) {
    console.error('Get application error:', error)
    return { success: false, message: 'Failed to connect to server' }
  }
}

export async function updatePersonalDetails(data: Partial<ApplicationData['personal_details']>): Promise<ApplicationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/application/personal-details`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    })

    return await response.json()
  } catch (error) {
    console.error('Update personal details error:', error)
    return { success: false, message: 'Failed to save personal details' }
  }
}

export async function updateDocuments(data: Record<string, unknown>): Promise<ApplicationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/application/documents`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    })

    return await response.json()
  } catch (error) {
    console.error('Update documents error:', error)
    return { success: false, message: 'Failed to save documents' }
  }
}

export async function updateUniversityDetails(data: Partial<ApplicationData['university']>): Promise<ApplicationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/application/university`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    })

    return await response.json()
  } catch (error) {
    console.error('Update university details error:', error)
    return { success: false, message: 'Failed to save university details' }
  }
}

export async function updateApplicationStep(step: number): Promise<ApplicationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/application/step?step=${step}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    })

    return await response.json()
  } catch (error) {
    console.error('Update step error:', error)
    return { success: false, message: 'Failed to update step' }
  }
}

export async function submitApplication(): Promise<ApplicationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/application/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })

    return await response.json()
  } catch (error) {
    console.error('Submit application error:', error)
    return { success: false, message: 'Failed to submit application' }
  }
}

export async function resetApplication(): Promise<ApplicationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/application/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })

    return await response.json()
  } catch (error) {
    console.error('Reset application error:', error)
    return { success: false, message: 'Failed to reset application' }
  }
}
