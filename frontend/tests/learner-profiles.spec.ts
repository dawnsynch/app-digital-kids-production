import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

const apiBase = 'http://127.0.0.1:8000'

function uniqueAccount(label: string) {
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return { name: label, email: `${label.toLowerCase().replace(/\s+/g, '-')}-${id}@example.com`, password: 'SafePass123!' }
}

async function registerApiParent(request: APIRequestContext, label: string) {
  const account = uniqueAccount(label)
  const response = await request.post(`${apiBase}/auth/register-parent`, {
    data: { full_name: account.name, email: account.email, password: account.password },
  })
  expect(response.status()).toBe(201)
  return { account, auth: await response.json() as { access_token: string; user: { id: number } } }
}

async function registerUiParent(page: Page, label = 'Phase One B Parent') {
  const account = uniqueAccount(label)
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

async function createUiLearner(page: Page, name = 'Amina Real') {
  await expect(page.getByText('No learners yet')).toBeVisible()
  await page.getByRole('button', { name: 'Add Your First Learner' }).click()
  await page.getByLabel('Learner name').fill(name)
  await page.getByLabel('CBC grade').selectOption('5')
  await page.getByLabel('Age group').fill('10-12')
  await page.getByRole('button', { name: 'Create Learner' }).click()
  await expect(page.getByRole('heading', { name })).toBeVisible()
  return name
}

test.describe('Phase 1B learner profiles', () => {
  test('parent registers, creates a learner, and retrieves it in the real list', async ({ page }, testInfo) => {
    await registerUiParent(page)
    await createUiLearner(page)
    await expect(page.getByText('Grade 5')).toBeVisible()
    await expect(page.getByText('Age group 10-12')).toBeVisible()
    await expect(page.getByText(/was added successfully/)).toBeVisible()
    if (process.env.CAPTURE_LEARNER_SCREENSHOTS === 'true') {
      await page.screenshot({ path: `/tmp/digital-kids-phase1b-${testInfo.project.name}.png`, fullPage: true })
    }
  })

  test('existing parent login loads existing backend learners', async ({ page, request }) => {
    const { account, auth } = await registerApiParent(request, 'Existing Parent')
    const created = await request.post(`${apiBase}/students`, {
      headers: { Authorization: `Bearer ${auth.access_token}` },
      data: { name: 'Existing Learner', grade: 6, age_group: '11-13' },
    })
    expect(created.ok()).toBe(true)

    await page.goto('/parent/sign-in')
    await page.getByLabel('Email Address').fill(account.email)
    await page.getByLabel('Password', { exact: true }).fill(account.password)
    await page.getByRole('button', { name: /^Sign In/ }).click()
    await expect(page.getByRole('heading', { name: 'Existing Learner' })).toBeVisible()
    await expect(page.getByText('Grade 6')).toBeVisible()
  })

  test('parent edits learner details without changing ownership', async ({ page }) => {
    await registerUiParent(page)
    await createUiLearner(page, 'Learner Before')
    const card = page.locator('.learner-choice').filter({ hasText: 'Learner Before' })
    await card.getByRole('button', { name: 'Edit' }).click()
    await page.getByLabel('Learner name').fill('Learner After')
    await page.getByLabel('CBC grade').selectOption('7')
    await page.getByRole('button', { name: 'Save Changes' }).click()
    await expect(page.getByRole('heading', { name: 'Learner After' })).toBeVisible()
    await expect(page.getByText('Grade 7')).toBeVisible()
    await expect(page.getByText(/profile was updated/)).toBeVisible()
  })

  test('cross-parent retrieval and update are concealed', async ({ request }) => {
    const parentA = await registerApiParent(request, 'Boundary Parent A')
    const parentB = await registerApiParent(request, 'Boundary Parent B')
    const created = await request.post(`${apiBase}/students`, {
      headers: { Authorization: `Bearer ${parentA.auth.access_token}` },
      data: { name: 'Private Learner', grade: 5 },
    })
    const learner = await created.json() as { id: number }
    const parentBHeaders = { Authorization: `Bearer ${parentB.auth.access_token}` }
    expect((await request.get(`${apiBase}/students/${learner.id}`, { headers: parentBHeaders })).status()).toBe(404)
    expect((await request.patch(`${apiBase}/students/${learner.id}`, { headers: parentBHeaders, data: { name: 'Blocked' } })).status()).toBe(404)
  })

  test('learner selection survives route navigation but creates no learner session', async ({ page }) => {
    await registerUiParent(page)
    await createUiLearner(page, 'Selected Learner')
    await page.getByRole('button', { name: 'Continue as Selected Learner' }).click()
    await expect(page).toHaveURL(/\/learner\/pin\?learner=\d+$/)
    await expect(page.getByRole('heading', { name: 'Hi Selected Learner! 👋' })).toBeVisible()
    await expect(page.getByText('Preview only.')).toBeVisible()
    await page.getByRole('button', { name: 'Switch Learner' }).click()
    await expect(page).toHaveURL(/\/parent\/select-learner$/)
    await expect(page.getByText('✓ Selected learner')).toBeVisible()
  })

  test('validation errors keep the create dialog open', async ({ page }) => {
    await registerUiParent(page)
    await expect(page.getByText('No learners yet')).toBeVisible()
    await page.getByRole('button', { name: 'Add Your First Learner' }).click()
    await page.getByRole('button', { name: 'Create Learner' }).click()
    await expect(page.getByText('Enter at least 2 characters for the learner name.')).toBeVisible()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('backend list failure shows retry and recovers to the empty state', async ({ page }) => {
    let failed = false
    await page.route('**/api/students', async (route) => {
      if (!failed && route.request().method() === 'GET') {
        failed = true
        await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ detail: 'Temporary failure' }) })
      } else {
        await route.fallback()
      }
    })
    await registerUiParent(page)
    await expect(page.getByText('We could not load learner profiles.')).toBeVisible()
    await page.getByRole('button', { name: 'Retry' }).click()
    await expect(page.getByText('No learners yet')).toBeVisible()
  })

  test('authentication expiry removes learner management UI', async ({ page }) => {
    await registerUiParent(page)
    await expect(page.getByText('No learners yet')).toBeVisible()
    await page.route('**/api/students', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ detail: 'Invalid or expired token' }) })
      } else {
        await route.fallback()
      }
    })
    await page.getByRole('button', { name: 'Add Your First Learner' }).click()
    await page.getByLabel('Learner name').fill('Expired Learner')
    await page.getByRole('button', { name: 'Create Learner' }).click()
    await expect(page).toHaveURL(/\/parent\/sign-in$/)
    await expect(page.getByRole('heading', { name: 'Who’s Learning Today?' })).not.toBeVisible()
  })

  test('logout clears selection and protected access', async ({ page }) => {
    const account = await registerUiParent(page)
    await createUiLearner(page, 'Session Learner')
    await page.getByRole('button', { name: 'Continue as Session Learner' }).click()
    await page.getByRole('button', { name: 'Switch Learner' }).click()
    await expect(page.getByText('✓ Selected learner')).toBeVisible()
    await page.getByRole('button', { name: 'Sign Out' }).click()
    await page.getByLabel('Email Address').fill(account.email)
    await page.getByLabel('Password', { exact: true }).fill(account.password)
    await page.getByRole('button', { name: /^Sign In/ }).click()
    await expect(page.getByRole('heading', { name: 'Session Learner' })).toBeVisible()
    await expect(page.getByText('✓ Selected learner')).not.toBeVisible()
  })
})
