/* TODO: can be used to mock the API during development
import { setupWorker } from 'msw/browser'

import { getBloggingMock } from '~/api/endpoints/blogging/blogging.msw'
import { getSendMessageMock } from '~/api/endpoints/send-message/send-message.msw'
import { getServiceMock } from '~/api/endpoints/service/service.msw'

const worker = setupWorker(
  ...getBloggingMock(),
  ...getSendMessageMock(),
  ...getServiceMock(),
)

// eslint-disable-next-line @typescript-eslint/no-floating-promises
worker.start()
*/
