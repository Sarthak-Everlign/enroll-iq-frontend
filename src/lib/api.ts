const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ============== University Types ==============

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
