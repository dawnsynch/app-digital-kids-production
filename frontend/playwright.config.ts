import { defineConfig, devices } from '@playwright/test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const e2eDirectory = mkdtempSync(join(tmpdir(), 'digital-kids-playwright-'))
const databaseUrl = `sqlite:///${join(e2eDirectory, 'e2e.db')}`
const python = process.env.PYTHON_EXECUTABLE || 'python3'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: [
    {
      command: `cd .. && ${python} -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000`,
      url: 'http://127.0.0.1:8000/health',
      reuseExistingServer: false,
      timeout: 120000,
      env: {
        APP_ENV: 'test',
        DATABASE_URL: databaseUrl,
        JWT_SECRET_KEY: 'playwright-only-secret-not-for-production',
        MOCK_AI_MODE: 'true',
      },
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173/parent/sign-in',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: { VITE_API_PROXY_TARGET: 'http://127.0.0.1:8000' },
    },
  ],
})
