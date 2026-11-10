import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

const apiBase = 'http://127.0.0.1:8010'
const pin = '246810'

function parentAccount(label: string) {
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return { name: label, email: `${label.toLowerCase().replace(/\s+/g, '-')}-${id}@example.com`, password: 'SafePass123!' }
}

async function authenticatedLearner(request: APIRequestContext, label: string, grade = 5) {
  const account = parentAccount(label)
  const registered = await request.post(`${apiBase}/auth/register-parent`, { data: { full_name: account.name, email: account.email, password: account.password } })
  const parent = await registered.json() as { access_token: string }
  const parentHeaders = { Authorization: `Bearer ${parent.access_token}` }
  const created = await request.post(`${apiBase}/students`, { headers: parentHeaders, data: { name: `${label} Learner`, grade } })
  const student = await created.json() as { id: number }
  expect((await request.post(`${apiBase}/students/${student.id}/learner-pin`, { headers: parentHeaders, data: { parent_password: account.password, pin } })).status()).toBe(200)
  const handoffResponse = await request.post(`${apiBase}/students/${student.id}/learner-handoff`, { headers: parentHeaders })
  const handoff = await handoffResponse.json() as { challenge: string }
  const redeemed = await request.post(`${apiBase}/auth/learner/redeem`, { data: { challenge: handoff.challenge, pin } })
  const learner = await redeemed.json() as { access_token: string }
  return { student, learner, parent }
}

async function authenticateThroughUi(page: Page, label = 'Practice Parent') {
  const account = parentAccount(label)
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
  await page.getByLabel('Learner name').fill('Practice Learner')
  await page.getByLabel('CBC grade').selectOption('5')
  await page.getByRole('button', { name: 'Create Learner' }).click()
  const card = page.locator('.learner-choice').filter({ hasText: 'Practice Learner' })
  await card.getByRole('button', { name: 'Manage PIN' }).click()
  await page.getByLabel('Parent password').fill(account.password)
  await page.getByLabel('New six-digit learner PIN').fill(pin)
  await page.getByLabel('Confirm learner PIN').fill(pin)
  await page.getByRole('button', { name: 'Set or Reset PIN' }).click()
  await page.getByRole('button', { name: 'Continue as Practice Learner' }).click()
  for (const [index, digit] of [...pin].entries()) await page.getByLabel(`PIN digit ${index + 1}`).fill(digit)
  await page.getByRole('button', { name: 'Start Learning' }).click()
  await expect(page).toHaveURL(/\/learner\/dashboard$/)
}

test.describe('Phase 2A CBC practice', () => {
  test('authenticated learner configures real mock-backed questions and retains drafts', async ({ page }, testInfo) => {
    await authenticateThroughUi(page)
    const nav = testInfo.project.name === 'mobile-chrome' ? page.locator('.bottomnav') : page.locator('.sidebar')
    await nav.getByRole('button', { name: 'Practice', exact: true }).click()
    await expect(page).toHaveURL(/\/learner\/practice$/)
    await expect(page.getByText('Practice Learner · Grade 5 verified learner practice')).toBeVisible()
    await page.getByLabel('Choose your subject').selectOption('Mathematics')
    await page.getByLabel('Choose your strand').selectOption('Fractions')
    await page.getByRole('radio', { name: /5 Questions/i }).click()
    await page.getByRole('button', { name: /Start Practice/ }).click()
    await expect(page).toHaveURL(/\/learner\/practice\/\d+$/)
    await expect(page.getByRole('heading', { name: 'Question 1 of 5' })).toBeVisible()
    const answer = page.getByLabel('Your draft answer')
    await answer.fill('A half is one of two equal parts.')
    await page.getByRole('button', { name: /Next/ }).click()
    await expect(page.getByRole('heading', { name: 'Question 2 of 5' })).toBeVisible()
    await page.getByRole('button', { name: 'Previous' }).click()
    await expect(page.getByLabel('Your draft answer')).toHaveValue('A half is one of two equal parts.')
    await expect(page.getByText(/answers are not submitted or marked/i)).toBeVisible()
    if (process.env.CAPTURE_PHASE2A_SCREENSHOTS === 'true') {
      await page.screenshot({ path: `/tmp/digital-kids-phase2a-${testInfo.project.name}.png`, fullPage: true })
    }
  })

  test('assessment ownership is enforced by the API', async ({ request }) => {
    const first = await authenticatedLearner(request, 'Practice Owner')
    const second = await authenticatedLearner(request, 'Practice Intruder', 6)
    const generated = await request.post(`${apiBase}/revision/learner/generate`, {
      headers: { Authorization: `Bearer ${first.learner.access_token}` },
      data: { request_id: `e2e_${Date.now()}_owner`, term: 1, subject: 'Mathematics', strand: 'Fractions', difficulty: 'Easy', question_count: 5 },
    })
    expect(generated.status()).toBe(200)
    const assessment = await generated.json() as { assessment_id: number; questions: unknown[] }
    expect(JSON.stringify(assessment)).not.toContain('expected_answer')
    const denied = await request.get(`${apiBase}/revision/learner/${assessment.assessment_id}`, { headers: { Authorization: `Bearer ${second.learner.access_token}` } })
    expect(denied.status()).toBe(403)
  })

  test('protected practice deep links require an active learner session', async ({ page }) => {
    await page.goto('/learner/practice/1')
    await expect(page).toHaveURL(/\/parent\/sign-in$/)
    await expect(page.getByText(/Sign in with a parent account to continue/)).toBeVisible()
  })
})
