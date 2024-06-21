//@ts-nocheck
import { faker } from '@faker-js/faker'
import { HttpResponse, delay, http } from 'msw'

export const getPingResponseMock = (overrideResponse: Partial<StringGenericValue> = {}): StringGenericValue => ({
  value: faker.helpers.arrayElement([faker.word.sample(), null]),
  ...overrideResponse,
})

export const getVersionResponseMock = (overrideResponse: Partial<VersionInformation> = {}): VersionInformation => ({
  constants: faker.helpers.arrayElement([
    Array.from({ length: faker.number.int({ min: 1, max: 10 }) }, (_, i) => i + 1).map(() => faker.word.sample()),
    undefined,
  ]),
  environmentName: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.word.sample(), null]), undefined]),
  informationalVersion: faker.helpers.arrayElement([
    faker.helpers.arrayElement([faker.word.sample(), null]),
    undefined,
  ]),
  version: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.word.sample(), null]), undefined]),
  ...overrideResponse,
})

export const getPingMockHandler = () => {
  return http.get('*/Service/ping', async () => {
    await delay(1000)
    return new HttpResponse(getPingResponseMock(), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  })
}

export const getVersionMockHandler = () => {
  return http.get('*/Service/version', async () => {
    await delay(1000)
    return new HttpResponse(getVersionResponseMock(), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  })
}
export const getServiceMock = () => [getPingMockHandler(), getVersionMockHandler()]
