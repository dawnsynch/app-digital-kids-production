import type {
  AuthToken,
  CodingLesson,
  CodingLessonRequest,
  HealthStatus,
  LearnerAccountCreate,
  LoginCredentials,
  ParentRegistration,
  ProgressSummary,
  RevisionAnswer,
  RevisionAssessment,
  RevisionGenerateRequest,
  RevisionOptions,
  RevisionResult,
  SpiritualLesson,
  SpiritualLessonRequest,
  Student,
  StudentCreate,
  StudentUpdate,
  User,
} from './types'

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown }

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ApiClient {
  private accessToken: string | null = null
  private authenticationFailureHandler: (() => void) | null = null

  constructor(private readonly baseUrl: string) {}

  setAccessToken(token: string | null) {
    this.accessToken = token
  }

  setAuthenticationFailureHandler(handler: (() => void) | null) {
    this.authenticationFailureHandler = handler
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const headers = new Headers(options.headers)
    headers.set('Accept', 'application/json')
    if (options.body !== undefined) headers.set('Content-Type', 'application/json')
    if (this.accessToken) headers.set('Authorization', `Bearer ${this.accessToken}`)

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
    const payload: unknown = response.status === 204 ? null : await response.json()
    if (!response.ok) {
      const detail = typeof payload === 'object' && payload && 'detail' in payload
        ? (payload as { detail?: unknown }).detail
        : payload
      if (response.status === 401 && this.accessToken) this.authenticationFailureHandler?.()
      const validationMessage = Array.isArray(detail)
        ? detail.find((item): item is { msg: string } => Boolean(item && typeof item === 'object' && 'msg' in item && typeof item.msg === 'string'))?.msg
        : undefined
      throw new ApiError(
        typeof detail === 'string' ? detail : validationMessage || response.statusText || 'Request failed',
        response.status,
        detail,
      )
    }
    return payload as T
  }

  health = () => this.request<HealthStatus>('/health')
  registerParent = (payload: ParentRegistration) => this.request<AuthToken>('/auth/register-parent', { method: 'POST', body: payload })
  login = (payload: LoginCredentials) => this.request<AuthToken>('/auth/login', { method: 'POST', body: payload })
  currentUser = () => this.request<User>('/auth/me')
  listStudents = () => this.request<Student[]>('/students')
  createStudent = (payload: StudentCreate) => this.request<Student>('/students', { method: 'POST', body: payload })
  getStudent = (studentId: number) => this.request<Student>(`/students/${studentId}`)
  updateStudent = (studentId: number, payload: StudentUpdate) =>
    this.request<Student>(`/students/${studentId}`, { method: 'PATCH', body: payload })
  createLearnerAccount = (studentId: number, payload: LearnerAccountCreate) =>
    this.request<User>(`/students/${studentId}/learner-account`, { method: 'POST', body: payload })
  revisionOptions = () => this.request<RevisionOptions>('/revision/options')
  generateRevision = (payload: RevisionGenerateRequest) => this.request<RevisionAssessment>('/revision/generate', { method: 'POST', body: payload })
  saveRevisionAnswers = (assessmentId: number, answers: RevisionAnswer[]) =>
    this.request<{ assessment_id: number; answers_count: number; message: string }>('/revision/answers', {
      method: 'POST',
      body: { assessment_id: assessmentId, answers },
    })
  markRevision = (assessmentId: number, answers: RevisionAnswer[]) =>
    this.request<RevisionResult>('/revision/submit', { method: 'POST', body: { assessment_id: assessmentId, answers } })
  codingLesson = (payload: CodingLessonRequest) => this.request<CodingLesson>('/learning/coding', { method: 'POST', body: payload })
  spiritualLesson = (payload: SpiritualLessonRequest) => this.request<SpiritualLesson>('/learning/spiritual', { method: 'POST', body: payload })
  studentProgress = (studentId: number) => this.request<ProgressSummary>(`/progress/student/${studentId}`)
}

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '/api'

export const apiClient = new ApiClient(configuredBaseUrl)
