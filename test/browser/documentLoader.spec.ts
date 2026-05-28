import { test, expect } from '@playwright/test'

test('securityLoader works in browser', async ({ page }) => {
  await page.goto('/test/index.html')
  const result = await page.evaluate(async () => {
    const { securityLoader } = await import('/src/index.ts')
    const contextObject = { '@context': { test: 'https://example.com/test' } }
    const loader = securityLoader()
    loader.addStatic('https://example.com/my-context/v1', contextObject)
    const documentLoader = loader.build()
    const res = await documentLoader('https://example.com/my-context/v1')
    return res.document
  })
  expect(result).toEqual({
    '@context': { test: 'https://example.com/test' }
  })
})
