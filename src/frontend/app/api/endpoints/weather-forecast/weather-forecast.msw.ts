//@ts-nocheck
import { faker } from '@faker-js/faker'

import { HttpResponse, delay, http } from 'msw'
import type { RequestHandlerOptions } from 'msw'

import type { WeatherForecast } from '../../models'

export const getGetWeatherForecastResponseMock = (): WeatherForecast[] =>
  Array.from({ length: faker.number.int({ min: 1, max: 10 }) }, (_, i) => i + 1).map(() => ({
    date: faker.helpers.arrayElement([faker.date.past().toISOString().slice(0, 10), undefined]),
    temperatureC: faker.helpers.arrayElement([faker.number.int(), undefined]),
    summary: faker.helpers.arrayElement([
      faker.helpers.arrayElement([faker.string.alpha({ length: { min: 10, max: 20 } }), null]),
      undefined,
    ]),
  }))

export const getGetWeatherForecastMockHandler = (
  overrideResponse?:
    | WeatherForecast[]
    | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<WeatherForecast[]> | WeatherForecast[]),
  options?: RequestHandlerOptions,
) => {
  return http.get(
    '*/api/v1/WeatherForecast',
    async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {
      await delay(1000)

      return HttpResponse.json(
        overrideResponse !== undefined
          ? typeof overrideResponse === 'function'
            ? await overrideResponse(info)
            : overrideResponse
          : getGetWeatherForecastResponseMock(),
        { status: 200 },
      )
    },
    options,
  )
}
export const getWeatherForecastMock = () => [getGetWeatherForecastMockHandler()]
