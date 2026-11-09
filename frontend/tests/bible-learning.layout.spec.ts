import { expect, test } from '@playwright/test'

test.describe('Bible Learning dashboard layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bible-learning')
    await page.waitForLoadState('networkidle')
  })

  test('renders the approved major sections and six learning categories', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Bible Learning', exact: true })).toBeVisible()
    await expect(page.locator('.bible__continue')).toBeVisible()
    await expect(page.locator('.bible__verse')).toBeVisible()
    await expect(page.locator('.bible__skill')).toHaveCount(6)
    await expect(page.locator('.bible__recommended')).toBeVisible()
    await expect(page.locator('.bible__practice')).toBeVisible()
    await expect(page.locator('.bible__progress')).toBeVisible()
  })

  test('contains illustrations and avoids horizontal overflow', async ({ page }) => {
    const result = await page.evaluate(() => {
      const selectors = [
        ['.bible__continue', '.bible__continue-art'],
        ['.bible__verse', '.bible__verse-art'],
      ] as const

      const contained = selectors.every(([parentSelector, childSelector]) => {
        const parent = document.querySelector<HTMLElement>(parentSelector)?.getBoundingClientRect()
        const child = document.querySelector<HTMLElement>(childSelector)?.getBoundingClientRect()
        return Boolean(
          parent && child &&
          child.left >= parent.left - 2 &&
          child.right <= parent.right + 2 &&
          child.top >= parent.top - 2 &&
          child.bottom <= parent.bottom + 2,
        )
      })

      return {
        contained,
        noHorizontalOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      }
    })

    expect(result.contained).toBe(true)
    expect(result.noHorizontalOverflow).toBe(true)
  })

  test('continue lesson remains interactive', async ({ page }) => {
    await page.getByRole('button', { name: 'Continue Lesson' }).first().click()
    await expect(page.getByText('Opening David and Goliath — lesson 4 of 7')).toBeVisible()
  })

  test('loads without browser console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
    expect(errors).toEqual([])
  })
})
