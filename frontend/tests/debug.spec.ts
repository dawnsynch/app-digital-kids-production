import { test, expect } from '@playwright/test'

test.describe('Debug: check element visibility and dimensions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/coding-technology')
    await page.waitForLoadState('networkidle')
  })

  test('inspect key elements', async ({ page }) => {
    // Check if elements exist and are visible
    const checks = [
      ['.coding-hero', 'hero'],
      ['.coding-hero__art', 'hero art'],
      ['.coding-continue', 'continue card'],
      ['.coding-continue__editor', 'continue editor img'],
      ['.coding-continue__art', 'continue art img'],
      ['.tech-skill', 'skill cards'],
      ['.coding__skills-grid', 'skills grid'],
      ['.coding-recommended', 'recommended panel'],
      ['.coding-challenge', 'challenge panel'],
      ['.coding-progress', 'progress panel'],
    ]

    for (const [selector, name] of checks) {
      const locator = page.locator(selector)
      const count = await locator.count()
      const isVisible = count > 0 ? await locator.first().isVisible() : false
      const box = count > 0 ? await locator.first().boundingBox() : null
      console.log(`${name}: count=${count}, visible=${isVisible}, box=${box ? JSON.stringify(box) : 'null'}`)
    }

    // Check image loading state
    const imgs = page.locator('img')
    const imgCount = await imgs.count()
    console.log(`Total img elements: ${imgCount}`)

    for (let i = 0; i < Math.min(imgCount, 10); i++) {
      const img = imgs.nth(i)
      const src = await img.getAttribute('src')
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
      const complete = await img.evaluate((el: HTMLImageElement) => el.complete)
      const box = await img.boundingBox()
      console.log(`img[${i}]: src=${src}, complete=${complete}, naturalWidth=${naturalWidth}, box=${box ? JSON.stringify(box) : 'null'}`)
    }
  })
})
