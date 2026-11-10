import type {
  AuthToken,
  CodingLesson,
  CodingLessonRequest,
  HealthStatus,
  LearnerAccountCreate,
  LearnerAccessStatus,
  LearnerHandoff,
  LearnerIdentity,
  LearnerAssessmentListItem,
  LearnerPracticeAssessment,
  LearnerPracticeGenerateRequest,
  LearnerPracticeOptions,
  LearnerReleasedFeedback,
  LearnerSubmissionReceipt,
  LoginCredentials,
  ParentRegistration,
  ParentAssessmentDetail,
  ParentAssessmentListItem,
  AssessmentStatusResponse,
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
    readonly retryAfterSeconds?: number,
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
        Number(response.headers.get('Retry-After')) || undefined,
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
  learnerAccessStatus = (studentId: number) => this.request<LearnerAccessStatus>(`/students/${studentId}/learner-access`)
  configureLearnerPin = (studentId: number, parentPassword: string, pin: string) =>
    this.request<LearnerAccessStatus>(`/students/${studentId}/learner-pin`, { method: 'POST', body: { parent_password: parentPassword, pin } })
  disableLearnerPin = (studentId: number, parentPassword: string) =>
    this.request<LearnerAccessStatus>(`/students/${studentId}/learner-pin/disable`, { method: 'POST', body: { parent_password: parentPassword } })
  createLearnerHandoff = (studentId: number) => this.request<LearnerHandoff>(`/students/${studentId}/learner-handoff`, { method: 'POST' })
  redeemLearnerHandoff = (challenge: string, pin: string) =>
    this.request<AuthToken>('/auth/learner/redeem', { method: 'POST', body: { challenge, pin } })
  learnerIdentity = () => this.request<LearnerIdentity>('/auth/learner/me')
  learnerLogout = () => this.request<null>('/auth/learner/logout', { method: 'POST' })
  learnerPracticeOptions = () => this.request<LearnerPracticeOptions>('/revision/learner/options')
  generateLearnerPractice = (payload: LearnerPracticeGenerateRequest) =>
    this.request<LearnerPracticeAssessment>('/revision/learner/generate', { method: 'POST', body: payload })
  learnerPracticeAssessment = (assessmentId: number) =>
    this.request<LearnerPracticeAssessment>(`/revision/learner/${assessmentId}`)
  submitLearnerAssessment = (assessmentId: number, requestId: string, answers: RevisionAnswer[]) =>
    this.request<LearnerSubmissionReceipt>(`/revision/learner/${assessmentId}/submit`, {
      method: 'POST', body: { request_id: requestId, answers },
    })
  learnerSubmissionStatus = (assessmentId: number) =>
    this.request<LearnerSubmissionReceipt>(`/revision/learner/${assessmentId}/submission`)
  learnerReleasedFeedback = (assessmentId: number) =>
    this.request<LearnerReleasedFeedback>(`/revision/learner/${assessmentId}/feedback`)
  learnerAssessments = () => this.request<LearnerAssessmentListItem[]>('/revision/learner/assessments')
  parentAssessments = (filters: { studentId?: number; status?: string } = {}) => {
    const query = new URLSearchParams()
    if (filters.studentId) query.set('student_id', String(filters.studentId))
    if (filters.status) query.set('status', filters.status)
    const suffix = query.size ? `?${query}` : ''
    return this.request<ParentAssessmentListItem[]>(`/revision/parent/assessments${suffix}`)
  }
  parentAssessment = (assessmentId: number) =>
    this.request<ParentAssessmentDetail>(`/revision/parent/assessments/${assessmentId}`)
  markParentAssessment = (assessmentId: number, requestId: string) =>
    this.request<ParentAssessmentDetail>(`/revision/parent/assessments/${assessmentId}/mark`, { method: 'POST', body: { request_id: requestId } })
  reviewParentAssessment = (assessmentId: number, requestId: string) =>
    this.request<AssessmentStatusResponse>(`/revision/parent/assessments/${assessmentId}/review`, { method: 'POST', body: { request_id: requestId } })
  releaseParentAssessment = (assessmentId: number, requestId: string) =>
    this.request<AssessmentStatusResponse>(`/revision/parent/assessments/${assessmentId}/release`, { method: 'POST', body: { request_id: requestId } })
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
