import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

const apiBase = 'http://127.0.0.1:8010'
const learnerPin = '246810'

function parentAccount(label: string) {
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return { name: label, email: `${label.toLowerCase().replace(/\s+/g, '-')}-${id}@example.com`, password: 'SafePass123!' }
}

async function registerParentAndLearner(request: APIRequestContext, label: string) {
  const account = parentAccount(label)
  const registered = await request.post(`${apiBase}/auth/register-parent`, {
    data: { full_name: account.name, email: account.email, password: account.password },
  })
  expect(registered.status()).toBe(201)
  const parent = await registered.json() as { access_token: string }
  const headers = { Authorization: `Bearer ${parent.access_token}` }
  const created = await request.post(`${apiBase}/students`, { headers, data: { name: `${label} Learner`, grade: 5 } })
  expect(created.status()).toBe(200)
  const student = await created.json() as { id: number }
  expect((await request.post(`${apiBase}/students/${student.id}/learner-pin`, {
    headers,
    data: { parent_password: account.password, pin: learnerPin },
  })).status()).toBe(200)
  const handoff = await request.post(`${apiBase}/students/${student.id}/learner-handoff`, { headers })
  const challenge = (await handoff.json() as { challenge: string }).challenge
  const redeemed = await request.post(`${apiBase}/auth/learner/redeem`, { data: { challenge, pin: learnerPin } })
  const learner = await redeemed.json() as { access_token: string }
  return { account, parent, learner, student }
}

async function registerThroughUi(page: Page) {
  const account = parentAccount('Workflow Parent')
  await page.goto('/parent/register')
  await page.getByLabel('Parent / Guardian Name').fill(account.name)
  await page.getByLabel('Email Address').fill(account.email)
  await page.getByLabel('Mobile Number').fill('+254 712 345 678')
  await page.getByLabel('Password', { exact: true }).fill(account.password)
  await page.getByLabel('Confirm Password', { exact: true }).fill(account.password)
  await page.getByRole('checkbox', { name: /I agree to the Terms of Use/ }).check()
  await page.getByRole('checkbox', { name: /I confirm that I am a parent/ }).check()
  await page.getByRole('button', { name: /Create Parent Account/i }).click()
  await page.getByRole('button', { name: 'Add Your First Learner' }).click()
  await page.getByLabel('Learner name').fill('Workflow Learner')
  await page.getByLabel('CBC grade').selectOption('5')
  await page.getByRole('button', { name: 'Create Learner' }).click()
  const card = page.locator('.learner-choice').filter({ hasText: 'Workflow Learner' })
  await card.getByRole('button', { name: 'Manage PIN' }).click()
  await page.getByLabel('Parent password').fill(account.password)
  await page.getByLabel('New six-digit learner PIN').fill(learnerPin)
  await page.getByLabel('Confirm learner PIN').fill(learnerPin)
  await page.getByRole('button', { name: 'Set or Reset PIN' }).click()
  await page.getByRole('button', { name: 'Continue as Workflow Learner' }).click()
  await enterPin(page)
  return account
}

async function enterPin(page: Page) {
  for (const [index, digit] of [...learnerPin].entries()) await page.getByLabel(`PIN digit ${index + 1}`).fill(digit)
  await page.getByRole('button', { name: 'Start Learning' }).click()
  await expect(page).toHaveURL(/\/learner\/dashboard$/)
}

test.describe('Phase 2B answer submission and parent-controlled marking', () => {
  test('learner submits, parent reviews and releases, then learner sees feedback', async ({ page }, testInfo) => {
    const account = await registerThroughUi(page)
    const learnerNav = testInfo.project.name === 'mobile-chrome' ? page.locator('.bottomnav') : page.locator('.sidebar')
    await learnerNav.getByRole('button', { name: 'Practice', exact: true }).click()
    const subject = page.getByLabel('Choose your subject')
    const strand = page.getByLabel('Choose your strand')
    const fiveQuestions = page.getByRole('radio', { name: '5 Questions', exact: true })
    await subject.selectOption('Mathematics')
    await expect(subject).toHaveValue('Mathematics')
    await strand.selectOption('Fractions')
    await expect(strand).toHaveValue('Fractions')
    await fiveQuestions.click()
    await expect(fiveQuestions).toHaveAttribute('aria-checked', 'true')
    await page.getByRole('button', { name: /Start Practice/ }).click()

    for (let question = 1; question <= 5; question += 1) {
      await page.getByLabel('Your draft answer').fill(`Final answer for question ${question}`)
      if (question < 5) await page.getByRole('button', { name: /Next/ }).click()
    }
    await page.getByRole('button', { name: /Review Answers/ }).click()
    await expect(page.getByRole('heading', { name: 'Review Your Answers' })).toBeVisible()
    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: /Submit Final Answers/ }).click()
    await expect(page.getByRole('heading', { name: 'Answers Submitted' })).toBeVisible()
    await expect(page.getByText(/final answers are locked safely/i)).toBeVisible()
    const assessmentId = Number(page.url().match(/practice\/(\d+)/)?.[1])
    expect(assessmentId).toBeGreaterThan(0)

    await page.getByRole('button', { name: 'Parent Sign In to Review' }).click()
    await page.getByLabel('Email Address').fill(account.email)
    await page.getByLabel('Password', { exact: true }).fill(account.password)
    await page.getByRole('button', { name: 'Sign In', exact: true }).click()
    await page.getByRole('button', { name: 'Assessment Review' }).click()
    await expect(page.getByRole('heading', { name: 'Submitted Assessments' })).toBeVisible()
    await page.locator('.parent-assessment-card').filter({ hasText: 'Workflow Learner' }).getByRole('button', { name: 'Review Assessment' }).click()
    await expect(page.getByText('Submitted learner answers are read-only.')).toBeVisible()
    await page.getByRole('button', { name: 'Start AI Marking' }).click()
    await expect(page.getByRole('heading', { name: 'Marking Result' })).toBeVisible()
    await expect(page.getByText(/AI-assisted marking requires parent judgment/i)).toBeVisible()
    await page.getByRole('button', { name: 'Confirm Parent Review' }).click()
    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Release to Learner' }).click()
    await expect(page.getByText('Results released to this learner.')).toBeVisible()
    const history = page.locator('.parent-audit')
    await expect(history.getByText('answers submitted')).toBeVisible()
    await expect(history.getByText('marking completed')).toBeVisible()
    await expect(history.getByText('results released')).toBeVisible()

    if (process.env.CAPTURE_PHASE2B_SCREENSHOTS === 'true') {
      await page.screenshot({ path: `/tmp/digital-kids-phase2b-${testInfo.project.name}.png`, fullPage: true })
    }

    await page.getByRole('button', { name: 'Back to Assessments' }).click()
    await page.getByRole('button', { name: 'Learners' }).click()
    await page.getByRole('button', { name: 'Continue as Workflow Learner' }).click()
    await enterPin(page)
    const returnNav = testInfo.project.name === 'mobile-chrome' ? page.locator('.bottomnav') : page.locator('.sidebar')
    await returnNav.getByRole('button', { name: 'Practice', exact: true }).click()
    await page.locator('.practice-recent').getByRole('button').filter({ hasText: 'released' }).click()
    await expect(page.getByRole('heading', { name: 'Released Feedback' })).toBeVisible()
    await expect(page.getByText(/Reviewed and released by your parent/)).toBeVisible()
  })

  test('role and family boundaries protect marking, release and feedback', async ({ request }) => {
    const owner = await registerParentAndLearner(request, 'Workflow Owner')
    const intruder = await registerParentAndLearner(request, 'Workflow Intruder')
    const learnerHeaders = { Authorization: `Bearer ${owner.learner.access_token}` }
    const generated = await request.post(`${apiBase}/revision/learner/generate`, {
      headers: learnerHeaders,
      data: { request_id: `phase2b_${Date.now()}_generate`, term: 1, subject: 'Mathematics', strand: 'Fractions', difficulty: 'Easy', question_count: 5 },
    })
    const assessment = await generated.json() as { assessment_id: number; questions: Array<{ id: number }> }
    const answers = assessment.questions.map((question) => ({ question_id: question.id, answer: 'immutable learner answer' }))
    expect((await request.post(`${apiBase}/revision/learner/${assessment.assessment_id}/submit`, {
      headers: learnerHeaders,
      data: { request_id: `phase2b_${Date.now()}_submit`, answers },
    })).status()).toBe(200)

    const learnerMark = await request.post(`${apiBase}/revision/parent/assessments/${assessment.assessment_id}/mark`, {
      headers: learnerHeaders,
      data: { request_id: `phase2b_${Date.now()}_learner_mark` },
    })
    expect(learnerMark.status()).toBe(403)
    const intruderHeaders = { Authorization: `Bearer ${intruder.parent.access_token}` }
    expect((await request.get(`${apiBase}/revision/parent/assessments/${assessment.assessment_id}`, { headers: intruderHeaders })).status()).toBe(404)
    expect((await request.post(`${apiBase}/revision/parent/assessments/${assessment.assessment_id}/release`, {
      headers: intruderHeaders,
      data: { request_id: `phase2b_${Date.now()}_intruder_release` },
    })).status()).toBe(404)
    expect((await request.get(`${apiBase}/revision/learner/${assessment.assessment_id}/feedback`, { headers: learnerHeaders })).status()).toBe(403)
  })

  test('parent assessment deep links require an authenticated parent', async ({ page }) => {
    await page.goto('/parent/assessments/1')
    await expect(page).toHaveURL(/\/parent\/sign-in$/)
    await expect(page.getByText(/Sign in with a parent account to continue/)).toBeVisible()
  })
})
