import { test } from '@playwright/test'

test.describe('Mobile Debug', () => {
  test('measure continue card on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/coding-technology')
    await page.waitForLoadState('networkidle')

    const data = await page.evaluate(() => {
      const card = document.querySelector('.coding-continue')
      const editor = document.querySelector('.coding-continue__editor')
      const art = document.querySelector('.coding-continue__art')
      const body = document.querySelector('.coding-continue__body')

      const getRect = (el: Element | null) => el ? el.getBoundingClientRect() : null

      return {
        card: getRect(card),
        editor: getRect(editor),
        art: getRect(art),
        body: getRect(body),
        viewportWidth: window.innerWidth,
        // Check computed styles
        editorStyle: editor ? window.getComputedStyle(editor) : null,
        artStyle: art ? window.getComputedStyle(art) : null,
      }
    })

    console.log(JSON.stringify(data, null, 2))
  })
})
