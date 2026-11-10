import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

const apiBase = 'http://127.0.0.1:8010'
const learnerPin = '246810'

function uniqueParent(label: string) {
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return { name: label, email: `${label.toLowerCase().replace(/\s+/g, '-')}-${id}@example.com`, password: 'SafePass123!' }
}

async function registerParent(page: Page, label = 'Secure Parent') {
  const account = uniqueParent(label)
  await page.goto('/parent/register')
  await page.getByLabel('Parent / Guardian Name').fill(account.name)
  await page.getByLabel('Email Address').fill(account.email)
  await page.getByLabel('Mobile Number').fill('+254 712 345 678')
  await page.getByLabel('Password', { exact: true }).fill(account.password)
  await page.getByLabel('Confirm Password', { exact: true }).fill(account.password)
  await page.getByRole('checkbox', { name: /I agree to the Terms of Use/ }).check()
  await page.getByRole('checkbox', { name: /I confirm that I am a parent/ }).check()
  await page.getByRole('button', { name: /Create Parent Account/i }).click()
  await expect(page).toHaveURL(/\/parent\/select-learner$/)
  return account
}

async function createLearner(page: Page, name = 'Secure Learner') {
  await page.getByRole('button', { name: 'Add Your First Learner' }).click()
  await page.getByLabel('Learner name').fill(name)
  await page.getByLabel('CBC grade').selectOption('5')
  await page.getByLabel('Age group').fill('10-12')
  await page.getByRole('button', { name: 'Create Learner' }).click()
  await expect(page.getByRole('heading', { name })).toBeVisible()
}

async function configurePin(page: Page, parentPassword: string, learnerName = 'Secure Learner') {
  const card = page.locator('.learner-choice').filter({ hasText: learnerName })
  await card.getByRole('button', { name: 'Manage PIN' }).click()
  await page.getByLabel('Parent password').fill(parentPassword)
  await page.getByLabel('New six-digit learner PIN').fill(learnerPin)
  await page.getByLabel('Confirm learner PIN').fill(learnerPin)
  await page.getByRole('button', { name: 'Set or Reset PIN' }).click()
  await expect(page.getByText(/learner PIN is ready/)).toBeVisible()
}

async function beginHandoff(page: Page, learnerName = 'Secure Learner') {
  await page.getByRole('button', { name: `Continue as ${learnerName}` }).click()
  await expect(page).toHaveURL(/\/learner\/pin$/)
  await expect(page.getByRole('heading', { name: `Hi ${learnerName}! 👋` })).toBeVisible()
}

async function enterPin(page: Page, pin: string) {
  for (const [index, digit] of [...pin].entries()) {
    await page.getByLabel(`PIN digit ${index + 1}`).fill(digit)
  }
}

async function registerApiParent(request: APIRequestContext, label: string) {
  const account = uniqueParent(label)
  const response = await request.post(`${apiBase}/auth/register-parent`, {
    data: { full_name: account.name, email: account.email, password: account.password },
  })
  expect(response.status()).toBe(201)
  return { account, auth: await response.json() as { access_token: string; user: { id: number } } }
}

test.describe('Phase 1C secure learner authentication', () => {
  test('parent authorizes learner PIN and child reaches the scoped dashboard', async ({ page }, testInfo) => {
    const parent = await registerParent(page)
    await createLearner(page)
    await configurePin(page, parent.password)
    await beginHandoff(page)
    await enterPin(page, learnerPin)
    await page.getByRole('button', { name: 'Start Learning' }).click()
    await expect(page).toHaveURL(/\/learner\/dashboard$/)
    await expect(page.getByText('Secure Learner · Grade 5')).toBeVisible()
    await expect(page.getByText('Verified learner session').first()).toBeVisible()
    await expect(page.getByText(/Practice, Subjects and Mathematics are connected/)).toBeVisible()
    if (process.env.CAPTURE_LEARNER_AUTH_SCREENSHOTS === 'true') {
      await page.screenshot({ path: `/tmp/digital-kids-phase1c-${testInfo.project.name}.png`, fullPage: true })
    }
  })

  test('incorrect PIN clears the fields and shows generic feedback', async ({ page }) => {
    const parent = await registerParent(page)
    await createLearner(page)
    await configurePin(page, parent.password)
    await beginHandoff(page)
    await enterPin(page, '000000')
    await page.getByRole('button', { name: 'Start Learning' }).click()
    await expect(page.getByText('The PIN could not be verified. Check it and try again.')).toBeVisible()
    await expect(page.getByLabel('PIN digit 1')).toHaveValue('')
  })

  test('attempt threshold renders cooldown and blocks repeated submission', async ({ page }) => {
    const parent = await registerParent(page)
    await createLearner(page)
    await configurePin(page, parent.password)
    await beginHandoff(page)
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await enterPin(page, '000000')
      await page.getByRole('button', { name: 'Start Learning' }).click()
      await expect(page.getByText(/PIN could not be verified/)).toBeVisible()
    }
    await enterPin(page, learnerPin)
    await page.getByRole('button', { name: 'Start Learning' }).click()
    await expect(page.getByText(/Too many attempts/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Temporarily Locked' })).toBeDisabled()
  })

  test('expired handoff feedback requires renewed parent authorization', async ({ page }) => {
    const parent = await registerParent(page)
    await createLearner(page)
    await configurePin(page, parent.password)
    await beginHandoff(page)
    await page.route('**/api/auth/learner/redeem', (route) => route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'This learner handoff is invalid or expired' }),
    }))
    await enterPin(page, learnerPin)
    await page.getByRole('button', { name: 'Start Learning' }).click()
    await expect(page.getByText(/handoff has expired/)).toBeVisible()
  })

  test('learner logout revokes protected dashboard access', async ({ page }) => {
    const parent = await registerParent(page)
    await createLearner(page)
    await configurePin(page, parent.password)
    await beginHandoff(page)
    await enterPin(page, learnerPin)
    await page.getByRole('button', { name: 'Start Learning' }).click()
    await page.getByRole('button', { name: 'Learner Sign Out' }).click()
    await expect(page).toHaveURL(/\/parent\/sign-in$/)
    await expect(page.getByText(/learner session was signed out securely/i)).toBeVisible()
    await page.goto('/learner/dashboard')
    await expect(page).toHaveURL(/\/parent\/sign-in$/)
  })

  test('parent token is removed during handoff and switching needs parent sign-in', async ({ page }) => {
    const parent = await registerParent(page)
    await createLearner(page)
    await configurePin(page, parent.password)
    await beginHandoff(page)
    await page.goto('/parent/select-learner')
    await expect(page).toHaveURL(/\/parent\/sign-in$/)
  })

  test('cross-parent learner authorization is concealed', async ({ request }) => {
    const owner = await registerApiParent(request, 'Handoff Owner')
    const intruder = await registerApiParent(request, 'Handoff Intruder')
    const created = await request.post(`${apiBase}/students`, {
      headers: { Authorization: `Bearer ${owner.auth.access_token}` },
      data: { name: 'Private Learner', grade: 5 },
    })
    const learner = await created.json() as { id: number }
    const denied = await request.post(`${apiBase}/students/${learner.id}/learner-pin`, {
      headers: { Authorization: `Bearer ${intruder.auth.access_token}` },
      data: { parent_password: intruder.account.password, pin: learnerPin },
    })
    expect(denied.status()).toBe(404)
  })
})
