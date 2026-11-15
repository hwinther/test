import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { getBloggingMock } from '~/api/endpoints/blogging/blogging.msw'
import { getSendMessageMock } from '~/api/endpoints/send-message/send-message.msw'
import { getServiceMock } from '~/api/endpoints/service/service.msw'
// jsdom has no <dialog> modal API or scrollIntoView; the modals and the chat use them.
if (typeof HTMLDialogElement !== 'undefined' && !('showModal' in HTMLDialogElement.prototype)) {
  Object.assign(HTMLDialogElement.prototype, {
    showModal(this: HTMLDialogElement) {
      this.open = true
    },
    close(this: HTMLDialogElement) {
      if (!this.open) return
      this.open = false
      this.dispatchEvent(new Event('close'))
    },
  })
}
if (typeof Element !== 'undefined' && !('scrollIntoView' in Element.prototype)) {
  Object.assign(Element.prototype, { scrollIntoView() {} })
}

const server = setupServer(...getBloggingMock(), ...getSendMessageMock(), ...getServiceMock())

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
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
