import { setupWorker } from 'msw/browser'

import { getWeatherForecastMock } from './api/endpoints/weather-forecast/weather-forecast.msw'

const worker = setupWorker(...getWeatherForecastMock())

// eslint-disable-next-line @typescript-eslint/no-floating-promises
worker.start()
