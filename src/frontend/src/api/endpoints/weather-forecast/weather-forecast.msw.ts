import { faker } from '@faker-js/faker'
import { HttpResponse, delay, http } from 'msw'

export const getGetWeatherForecastResponseMock = (overrideResponse: any = {}): WeatherForecast[] =>
  Array.from({ length: faker.number.int({ max: 10, min: 1 }) }, (_, i) => i + 1).map(() => ({
    date: faker.helpers.arrayElement([faker.date.past().toISOString().split('T')[0], undefined]),
    summary: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.word.sample(), null]), undefined]),
    temperatureC: faker.helpers.arrayElement([faker.number.int({ max: undefined, min: undefined }), undefined]),
    ...overrideResponse,
  }))

export const getGetWeatherForecastMockHandler = () => {
  return http.get('*/WeatherForecast', async () => {
    await delay(1000)
    return new HttpResponse(getGetWeatherForecastResponseMock(), {
      headers: {
        'Content-Type': 'text/plain',
      },
      status: 200,
    })
  })
}
export const getWeatherForecastMock = () => [getGetWeatherForecastMockHandler()]
