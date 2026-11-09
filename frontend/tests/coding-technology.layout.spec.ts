import { test, expect } from '@playwright/test'

test.describe('Coding & Technology Dashboard Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/coding-technology')
    await page.waitForLoadState('networkidle')
  })

  // Helper: measure one element matching a selector via page.evaluate
  async function measureOne(page: import('@playwright/test').Page, selector: string) {
    return page.evaluate((sel: string) => {
      const el = document.querySelector<HTMLElement>(sel)
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, bottom: r.bottom, left: r.left, right: r.right }
    }, selector)
  }

  // Helper: measure all elements matching a selector via page.evaluate
  async function measureAll(page: import('@playwright/test').Page, selector: string) {
    return page.evaluate((sel: string) => {
      const els = document.querySelectorAll<HTMLElement>(sel)
      return Array.from(els).map(el => {
        const r = el.getBoundingClientRect()
        return { x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, bottom: r.bottom, left: r.left, right: r.right }
      })
    }, selector)
  }

  test('hero banner is contained within its container', async ({ page }) => {
    const hero = await measureOne(page, '.coding-hero')
    const art = await measureOne(page, '.coding-hero__art')

    expect(hero).not.toBeNull()
    expect(art).not.toBeNull()

    if (art!.width === 0 || art!.height === 0) return

    // Hero image should not overflow the hero container horizontally
    expect(art!.width).toBeLessThanOrEqual(hero!.width + 2)
    // Hero image should be within vertical bounds
    expect(art!.top).toBeGreaterThanOrEqual(hero!.top - 2)
    expect(art!.bottom).toBeLessThanOrEqual(hero!.bottom + 2)
  })

  test('Continue Learning card images are contained within the card', async ({ page }) => {
    const card = await measureOne(page, '.coding-continue')
    const editor = await measureOne(page, '.coding-continue__editor')
    const art = await measureOne(page, '.coding-continue__art')

    expect(card).not.toBeNull()

    if (editor && editor.width > 0 && editor.height > 0) {
      expect(editor.right).toBeLessThanOrEqual(card!.right + 2)
      expect(editor.left).toBeGreaterThanOrEqual(card!.left - 2)
      expect(editor.top).toBeGreaterThanOrEqual(card!.top - 2)
      expect(editor.bottom).toBeLessThanOrEqual(card!.bottom + 2)
    }

    if (art && art.width > 0 && art.height > 0) {
      expect(art.right).toBeLessThanOrEqual(card!.right + 2)
      expect(art.left).toBeGreaterThanOrEqual(card!.left - 2)
      expect(art.top).toBeGreaterThanOrEqual(card!.top - 2)
      expect(art.bottom).toBeLessThanOrEqual(card!.bottom + 2)
    }
  })

  test('learning card grid has consistent column layout', async ({ page }) => {
    const grid = await measureOne(page, '.coding__skills-grid')
    const cards = await measureAll(page, '.tech-skill')

    expect(grid).not.toBeNull()
    expect(cards.length).toBeGreaterThan(0)

    // Verify cards are arranged in a grid (at least 2 cards in first row on desktop)
    if (cards.length >= 3) {
      const firstRowTop = cards[0].top
      const sameRowCards = cards.filter(c => Math.abs(c.top - firstRowTop) < 5)
      if (page.viewportSize()!.width <= 520) {
        expect(sameRowCards.length).toBe(1)
      } else {
        expect(sameRowCards.length).toBeGreaterThanOrEqual(2)
      }
    }

    // Verify no card overflows the grid container
    for (const card of cards) {
      expect(card.right).toBeLessThanOrEqual(grid!.right + 2)
    }
  })

  test('skill cards have consistent height alignment', async ({ page }) => {
    const cards = await measureAll(page, '.tech-skill')

    if (cards.length >= 2) {
      const heights = cards.map(c => c.height)
      const maxHeight = Math.max(...heights)
      const minHeight = Math.min(...heights)
      // Allow small variance due to content wrapping
      expect(maxHeight - minHeight).toBeLessThan(30)
    }
  })

  test('bottom row panels are aligned', async ({ page }) => {
    const bottom = await measureOne(page, '.coding__bottom')
    const panels = await measureAll(page, '.coding-recommended, .coding-challenge, .coding-progress')

    expect(bottom).not.toBeNull()
    expect(panels.length).toBeGreaterThan(0)

    if (page.viewportSize()!.width <= 768) {
      expect(Math.abs(panels[0].top - panels[1].top)).toBeLessThan(5)
      expect(panels[2].top).toBeGreaterThanOrEqual(Math.max(panels[0].bottom, panels[1].bottom) - 2)
    } else {
      // Desktop panels share a common top edge.
      for (const panel of panels) {
        expect(Math.abs(panel.top - bottom!.top)).toBeLessThan(5)
      }
    }

    // No panel should overflow the bottom row container
    for (const panel of panels) {
      expect(panel.right).toBeLessThanOrEqual(bottom!.right + 2)
    }
  })

  test('mobile layout stacks sections vertically', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.waitForLoadState('networkidle')

    const hero = await measureOne(page, '.coding-hero')
    const continueCard = await measureOne(page, '.coding-continue')
    const skillsGrid = await measureOne(page, '.coding__skills-grid')
    const bottomRow = await measureOne(page, '.coding__bottom')

    expect(hero).not.toBeNull()
    expect(continueCard).not.toBeNull()
    expect(skillsGrid).not.toBeNull()
    expect(bottomRow).not.toBeNull()

    // Sections should stack vertically (each starts below the previous)
    expect(continueCard!.top).toBeGreaterThan(hero!.bottom - 10)
    expect(skillsGrid!.top).toBeGreaterThan(continueCard!.bottom - 10)
    expect(bottomRow!.top).toBeGreaterThan(skillsGrid!.bottom - 10)

    // Skill cards should not overflow container on mobile
    const cardBoxes = await measureAll(page, '.tech-skill')
    if (cardBoxes.length > 0 && skillsGrid) {
      const maxRight = Math.max(...cardBoxes.map(b => b.right))
      expect(maxRight).toBeLessThanOrEqual(skillsGrid.right + 2)
    }
  })

  test('all key sections are present on the page', async ({ page }) => {
    await expect(page.locator('.coding-hero')).toBeVisible()
    await expect(page.locator('.coding-continue')).toBeVisible()
    await expect(page.locator('.coding__skills')).toBeVisible()
    await expect(page.locator('.coding__bottom')).toBeVisible()
    await expect(page.locator('.coding-recommended')).toBeVisible()
    await expect(page.locator('.coding-challenge')).toBeVisible()
    await expect(page.locator('.coding-progress')).toBeVisible()
  })

  test('skill cards display correct content', async ({ page }) => {
    await expect(page.locator('.tech-skill__title')).toHaveText([
      'Computer Basics',
      'Digital Skills',
      'Coding Fundamentals',
      'Internet & Online Safety',
      'Build with Code',
      'Robotics & Smart Technology',
    ])
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
