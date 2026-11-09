import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiClient } from './client'

afterEach(() => vi.unstubAllGlobals())

describe('ApiClient authentication failures', () => {
  it('clears an established session on 401', async () => {
    const client = new ApiClient('/api')
    const onFailure = vi.fn()
    client.setAccessToken('secret-token')
    client.setAuthenticationFailureHandler(onFailure)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: 'Expired' }), { status: 401, headers: { 'Content-Type': 'application/json' } })))

    await expect(client.currentUser()).rejects.toEqual(expect.objectContaining({ status: 401 }))
    expect(onFailure).toHaveBeenCalledOnce()
  })

  it('keeps an established session on 403', async () => {
    const client = new ApiClient('/api')
    const onFailure = vi.fn()
    client.setAccessToken('secret-token')
    client.setAuthenticationFailureHandler(onFailure)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } })))

    await expect(client.listStudents()).rejects.toEqual(expect.objectContaining({ status: 403 }))
    expect(onFailure).not.toHaveBeenCalled()
  })
})
