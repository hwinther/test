//@ts-nocheck
import { faker } from '@faker-js/faker'
import { HttpResponse, delay, http } from 'msw'
import type { StringGenericValue, VersionInformation } from '../../models'

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

export const getPingMockHandler = (
  overrideResponse?:
    | StringGenericValue
    | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<StringGenericValue> | StringGenericValue),
) => {
  return http.get('*/Service/ping', async (info) => {
    await delay(1000)
    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === 'function'
            ? await overrideResponse(info)
            : overrideResponse
          : getPingResponseMock(),
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

export const getVersionMockHandler = (
  overrideResponse?:
    | VersionInformation
    | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<VersionInformation> | VersionInformation),
) => {
  return http.get('*/Service/version', async (info) => {
    await delay(1000)
    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === 'function'
            ? await overrideResponse(info)
            : overrideResponse
          : getVersionResponseMock(),
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
export const getServiceMock = () => [getPingMockHandler(), getVersionMockHandler()]
