/* TODO: can be used to mock the API during development
import { setupWorker } from 'msw/browser'

import { getBloggingMock } from '~/api/endpoints/blogging/blogging.msw'
import { getSendMessageMock } from '~/api/endpoints/send-message/send-message.msw'
import { getServiceMock } from '~/api/endpoints/service/service.msw'
import { getWeatherForecastMock } from '~/api/endpoints/weather-forecast/weather-forecast.msw'

const worker = setupWorker(
  ...getBloggingMock(),
  ...getSendMessageMock(),
  ...getServiceMock(),
  ...getWeatherForecastMock(),
)

// eslint-disable-next-line @typescript-eslint/no-floating-promises
worker.start()
*/
