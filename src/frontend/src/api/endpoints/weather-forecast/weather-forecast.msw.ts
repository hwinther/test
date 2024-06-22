//@ts-nocheck
import { faker } from '@faker-js/faker'
import { HttpResponse, delay, http } from 'msw'
import type { WeatherForecast } from '../../models'

export const getGetWeatherForecastResponseMock = (): WeatherForecast[] =>
  Array.from({ length: faker.number.int({ min: 1, max: 10 }) }, (_, i) => i + 1).map(() => ({
    date: faker.helpers.arrayElement([faker.date.past().toISOString().split('T')[0], undefined]),
    summary: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.word.sample(), null]), undefined]),
    temperatureC: faker.helpers.arrayElement([faker.number.int({ min: undefined, max: undefined }), undefined]),
  }))

export const getGetWeatherForecastMockHandler = (
  overrideResponse?:
    | WeatherForecast[]
    | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<WeatherForecast[]> | WeatherForecast[]),
) => {
  return http.get('*/WeatherForecast', async (info) => {
    await delay(1000)
    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === 'function'
            ? await overrideResponse(info)
            : overrideResponse
          : getGetWeatherForecastResponseMock(),
      ),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  })
}
export const getWeatherForecastMock = () => [getGetWeatherForecastMockHandler()]
