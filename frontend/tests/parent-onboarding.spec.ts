import { expect, test, type Page } from '@playwright/test'

const publicRoutes = [
  ['/parent/get-started', 'Learning made personal, safe and fun.'],
  ['/parent/register', 'Create Your Parent Account'],
  ['/parent/sign-in', 'Welcome Back'],
  ['/learner/pin?learner=amina', 'Hi Amina! 👋'],
] as const

function uniqueParent() {
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return { name: 'Phase One Parent', email: `phase1a-${id}@example.com`, password: 'SafePass123!' }
}

async function registerParent(page: Page, parent = uniqueParent()) {
  await page.goto('/parent/register')
  await page.getByLabel('Parent / Guardian Name').fill(parent.name)
  await page.getByLabel('Email Address').fill(parent.email)
  await page.getByLabel('Mobile Number').fill('+254 712 345 678')
  await page.getByLabel('Password', { exact: true }).fill(parent.password)
  await page.getByLabel('Confirm Password', { exact: true }).fill(parent.password)
  await page.getByRole('checkbox', { name: /I agree to the Terms of Use/ }).check()
  await page.getByRole('checkbox', { name: /I confirm that I am a parent/ }).check()
  await page.getByRole('button', { name: /Create Parent Account/i }).click()
  await expect(page).toHaveURL(/\/parent\/select-learner$/)
  await expect(page.getByText('Your parent account was created and verified successfully.')).toBeVisible()
  return parent
}

test.describe('Phase 1A parent authentication', () => {
  for (const [route, heading] of publicRoutes) {
    test(`${heading} renders without errors or horizontal overflow`, async ({ page }) => {
      const errors: string[] = []
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text())
      })
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
      expect(errors).toEqual([])
    })
  }

  test('get started and sign-in links route correctly', async ({ page }) => {
    await page.goto('/parent/get-started')
    await page.getByRole('button', { name: /Get Started/i }).click()
    await expect(page).toHaveURL(/\/parent\/register$/)
    await page.getByRole('link', { name: 'Sign In' }).click()
    await expect(page).toHaveURL(/\/parent\/sign-in$/)
  })

  test('registration reports required and format validation accessibly', async ({ page }) => {
    await page.goto('/parent/register')
    await page.getByRole('button', { name: /Create Parent Account/i }).click()
    await expect(page.getByText(/Enter at least 2 characters/)).toBeVisible()
    await expect(page.getByText('Enter an email address.')).toBeVisible()
    await page.getByLabel('Email Address').fill('not-an-email')
    await page.getByRole('button', { name: /Create Parent Account/i }).click()
    await expect(page.getByText('Enter a valid email address.')).toBeVisible()
  })

  test('registration, logout, real login, and protected landing work together', async ({ page }, testInfo) => {
    const consoleErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    const parent = await registerParent(page)
    await expect(page.getByText(`Signed in as ${parent.name}.`)).toBeVisible()
    await page.getByRole('button', { name: 'Sign Out' }).click()
    await expect(page).toHaveURL(/\/parent\/sign-in$/)
    await page.getByLabel('Email Address').fill(parent.email)
    await page.getByLabel('Password', { exact: true }).fill(parent.password)
    await page.getByRole('button', { name: /^Sign In/ }).click()
    await expect(page).toHaveURL(/\/parent\/select-learner$/)
    await expect(page.getByText(`Signed in as ${parent.name}.`)).toBeVisible()
    await expect(page).toHaveTitle(/Digital Kids/i)
    await expect(page.locator('vite-error-overlay')).toHaveCount(0)
    expect(consoleErrors).toEqual([])
    if (process.env.CAPTURE_AUTH_SCREENSHOTS === 'true') {
      await page.screenshot({ path: `/tmp/digital-kids-phase1a-${testInfo.project.name}.png`, fullPage: true })
    }
  })

  test('invalid credentials show safe feedback and restore the submit control', async ({ page }) => {
    await page.goto('/parent/sign-in')
    await page.getByLabel('Email Address').fill('missing@example.com')
    await page.getByLabel('Password', { exact: true }).fill('wrong-password')
    await page.getByRole('button', { name: /^Sign In/ }).click()
    await expect(page.getByRole('alert')).toContainText('The email or password is incorrect.')
    await expect(page.getByRole('button', { name: /^Sign In/ })).toBeEnabled()
    await expect(page).toHaveURL(/\/parent\/sign-in$/)
  })

  test('unauthenticated deep link is redirected without exposing protected content', async ({ page }) => {
    await page.goto('/parent/select-learner')
    await expect(page).toHaveURL(/\/parent\/sign-in$/)
    await expect(page.getByText('Sign in with a parent account to continue.')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Who’s Learning Today?' })).not.toBeVisible()
  })

  test('logout rejects later protected navigation', async ({ page }) => {
    await registerParent(page)
    await page.getByRole('button', { name: 'Sign Out' }).click()
    await page.goto('/parent/select-learner')
    await expect(page).toHaveURL(/\/parent\/sign-in$/)
  })

  test('full refresh requires reauthentication for an in-memory session', async ({ page }) => {
    await registerParent(page)
    await page.reload()
    await expect(page).toHaveURL(/\/parent\/sign-in$/)
    await expect(page.getByText('Sign in with a parent account to continue.')).toBeVisible()
  })

  test('password visibility control works', async ({ page }) => {
    await page.goto('/parent/sign-in')
    const password = page.getByLabel('Password', { exact: true })
    await expect(password).toHaveAttribute('type', 'password')
    await page.getByRole('button', { name: 'Show password' }).click()
    await expect(password).toHaveAttribute('type', 'text')
  })

  test('learner PIN remains a non-authenticated preview and is not expanded in Phase 1A', async ({ page }) => {
    await page.goto('/learner/pin?learner=david')
    for (const [index, digit] of ['9', '9', '9', '9'].entries()) {
      await page.getByLabel(`PIN digit ${index + 1}`).fill(digit)
    }
    await page.getByRole('button', { name: /^Continue/ }).click()
    await expect(page.getByText('That demo PIN is not correct. Use 1234.')).toBeVisible()
  })
})
