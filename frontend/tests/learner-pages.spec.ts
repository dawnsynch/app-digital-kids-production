import { expect, test } from '@playwright/test'

const learnerPages = [
  ['/achievements', 'Achievements'],
  ['/progress', 'My Progress'],
  ['/profile', 'My Profile'],
  ['/help', 'Help'],
  ['/settings', 'Settings'],
] as const

test.describe('Phase 2A learner pages', () => {
  for (const [route, heading] of learnerPages) {
    test(`${heading} renders without console errors or horizontal overflow`, async ({ page }) => {
      const errors: string[] = []
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text())
      })

      await page.goto(route)
      await page.waitForLoadState('networkidle')
      await expect(page.getByRole('heading', { name: heading, exact: true }).first()).toBeVisible()

      const noHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      )
      expect(noHorizontalOverflow).toBe(true)
      expect(errors).toEqual([])
    })
  }

  test('sidebar navigation opens the achievements route', async ({ page, isMobile }) => {
    test.skip(isMobile, 'The full sidebar is intentionally replaced by mobile navigation.')
    await page.goto('/')
    await page.locator('.sidebar').getByRole('button', { name: 'Achievements' }).click()
    await expect(page).toHaveURL(/\/achievements$/)
    await expect(page.getByRole('heading', { name: 'Achievements', exact: true }).first()).toBeVisible()
  })

  test('achievement badges can be expanded', async ({ page }) => {
    await page.goto('/achievements')
    await expect(page.locator('.achievement-badge')).toHaveCount(4)
    await page.getByRole('button', { name: /View All Badges/i }).click()
    await expect(page.locator('.achievement-badge')).toHaveCount(6)
  })

  test('progress practice action routes to Practice', async ({ page }) => {
    await page.goto('/progress')
    await page.getByRole('button', { name: 'Practice Fractions', exact: true }).first().click()
    await expect(page).toHaveURL(/\/practice$/)
  })

  test('profile editing is clearly local and updates the preview', async ({ page }) => {
    await page.goto('/profile')
    await page.getByRole('button', { name: /Edit Profile/i }).click()
    await page.getByLabel('Display name').fill('Nia')
    await page.getByRole('button', { name: 'Update Preview' }).click()
    await expect(page.getByRole('heading', { name: 'Nia' })).toBeVisible()
    await expect(page.getByText('Profile updated for this session only.')).toBeVisible()
  })

  test('help accordion and Kito local preview respond', async ({ page }) => {
    await page.goto('/help')
    await page.getByRole('button', { name: /How do I continue a lesson/i }).click()
    await expect(page.getByText(/Open Learn and select Continue/)).toBeVisible()

    await page.getByRole('button', { name: 'Ask Kito', exact: true }).click()
    await page.getByLabel('Your question').fill('How do I practise fractions?')
    await page.getByRole('button', { name: 'Send to Kito' }).click()
    await expect(page.getByText(/This preview uses local guidance/)).toBeVisible()
  })

  test('settings switches update accessible state and session notice', async ({ page }) => {
    await page.goto('/settings')
    const readAloud = page.getByRole('switch', { name: 'Read Lessons Aloud' })
    await expect(readAloud).toHaveAttribute('aria-checked', 'true')
    await readAloud.click()
    await expect(readAloud).toHaveAttribute('aria-checked', 'false')
    await expect(page.getByText('Preferences updated for this session')).toBeVisible()
  })

  test('existing Kito sidebar interaction still works', async ({ page, isMobile }) => {
    test.skip(isMobile, 'The full sidebar is intentionally replaced by mobile navigation.')
    await page.goto('/achievements')
    await page.getByRole('button', { name: 'Chat with Kito' }).click()
    await expect(page.getByRole('dialog', { name: 'Kito chat' })).toBeVisible()
  })
})
