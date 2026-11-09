import { expect, test } from '@playwright/test'

const viewports = [1440, 1280, 768, 390] as const

type Box = { top: number; right: number; bottom: number; left: number }

const overlaps = (a: Box, b: Box) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

for (const width of viewports) {
  test(`coding artwork stays separated and contained at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/coding-technology')
    await page.waitForLoadState('networkidle')

    const result = await page.evaluate(() => {
      const box = (selector: string) => {
        const rect = document.querySelector<HTMLElement>(selector)!.getBoundingClientRect()
        return { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left }
      }
      const card = box('.coding-continue')
      const body = box('.coding-continue__body')
      const media = box('.coding-continue__visual')
      const progress = box('.coding-continue__bar')
      const hero = box('.coding-hero')
      const heroArt = document.querySelector<HTMLElement>('.coding-hero__art')!.getBoundingClientRect()
      const skillCards = [...document.querySelectorAll<HTMLElement>('.tech-skill')]
      const skillArt = [...document.querySelectorAll<HTMLElement>('.tech-skill__art')]

      return {
        card,
        body,
        media,
        progress,
        hero,
        heroArt: { top: heroArt.top, right: heroArt.right, bottom: heroArt.bottom, left: heroArt.left, width: heroArt.width },
        noHorizontalOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        allSkillArtContained: skillArt.every((art, index) => {
          const a = art.getBoundingClientRect()
          const c = skillCards[index].getBoundingClientRect()
          return a.left >= c.left - 2 && a.right <= c.right + 2 && a.top >= c.top - 2 && a.bottom <= c.bottom + 2
        }),
      }
    })

    expect(result.noHorizontalOverflow).toBe(true)
    expect(result.allSkillArtContained).toBe(true)
    expect(result.progress.left).toBeGreaterThanOrEqual(result.body.left)
    expect(result.progress.right).toBeLessThanOrEqual(result.body.right + 1)
    expect(overlaps(result.body, result.media)).toBe(false)
    expect(result.media.right).toBeLessThanOrEqual(result.card.right + 1)
    expect(result.media.bottom).toBeLessThanOrEqual(result.card.bottom + 1)
    if (result.heroArt.width > 0) {
      expect(result.heroArt.right).toBeLessThanOrEqual(result.hero.right + 1)
      expect(result.heroArt.bottom).toBeLessThanOrEqual(result.hero.bottom + 1)
    }
  })

  test(`Bible lesson, verse, and category media stay separated at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/bible-learning')
    await page.waitForLoadState('networkidle')

    const result = await page.evaluate(() => {
      const box = (selector: string) => {
        const rect = document.querySelector<HTMLElement>(selector)!.getBoundingClientRect()
        return { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left }
      }
      const lesson = box('.bible__continue')
      const lessonBody = box('.bible__continue-body')
      const lessonMedia = box('.bible__continue-media')
      const progress = box('.bible__continue-bar')
      const verse = box('.bible__verse')
      const quote = box('.bible__verse-quote')
      const actions = box('.bible__verse-actions')
      const skillCards = [...document.querySelectorAll<HTMLElement>('.bible__skill')]
      const skillMedia = [...document.querySelectorAll<HTMLElement>('.bible__skill-media')]

      return {
        lesson,
        lessonBody,
        lessonMedia,
        progress,
        verse,
        quote,
        actions,
        noHorizontalOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        allSkillMediaContained: skillMedia.every((media, index) => {
          const m = media.getBoundingClientRect()
          const c = skillCards[index].getBoundingClientRect()
          return m.left >= c.left - 2 && m.right <= c.right + 2 && m.top >= c.top - 2 && m.bottom <= c.bottom + 2
        }),
      }
    })

    expect(result.noHorizontalOverflow).toBe(true)
    expect(result.allSkillMediaContained).toBe(true)
    expect(overlaps(result.lessonBody, result.lessonMedia)).toBe(false)
    expect(result.progress.right).toBeLessThanOrEqual(result.lessonBody.right + 1)
    expect(result.lessonMedia.right).toBeLessThanOrEqual(result.lesson.right + 1)
    expect(result.actions.top).toBeGreaterThanOrEqual(result.quote.bottom - 1)
    expect(result.actions.bottom).toBeLessThanOrEqual(result.verse.bottom + 1)
  })
}
