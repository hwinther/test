import type matchers from '@testing-library/jest-dom/matchers'

import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { getBloggingMock } from '~/api/endpoints/blogging/blogging.msw'
import { getSendMessageMock } from '~/api/endpoints/send-message/send-message.msw'
import { getServiceMock } from '~/api/endpoints/service/service.msw'
import { getWeatherForecastMock } from '~/api/endpoints/weather-forecast/weather-forecast.msw'

const server = setupServer(
  ...getBloggingMock(),
  ...getSendMessageMock(),
  ...getServiceMock(),
  ...getWeatherForecastMock(),
)

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

//  Close server after all tests
afterAll(() => {
  server.close()
})

// Reset handlers after each test `important for test isolation`
afterEach(() => {
  cleanup()
  server.resetHandlers()
})

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- necessary to extend vitest Assertion interface with jest and TestingLibrary matchers
  interface Assertion<T = any> extends jest.Matchers<void, T>, matchers.TestingLibraryMatchers<T, void> {}
}
