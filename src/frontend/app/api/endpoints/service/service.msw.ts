//@ts-nocheck
import {
  faker
} from '@faker-js/faker';

import {
  HttpResponse,
  delay,
  http
} from 'msw';
import type {
  RequestHandlerOptions
} from 'msw';

import type {
  StringGenericValue,
  VersionInformation
} from '../../models';


export const getPingResponseMock = (overrideResponse: Partial<Extract<StringGenericValue, object>> = {}): StringGenericValue => ({value: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), null]), ...overrideResponse})

export const getVersionResponseMock = (overrideResponse: Partial<Extract<VersionInformation, object>> = {}): VersionInformation => ({constants: faker.helpers.arrayElement([Array.from({ length: faker.number.int({min: 1, max: 10}) }, (_, i) => i + 1).map(() => (faker.string.alpha({length: {min: 10, max: 20}}))), undefined]), version: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), undefined]), informationalVersion: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), undefined]), environmentName: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), undefined]), ...overrideResponse})


export const getPingMockHandler = (overrideResponse?: StringGenericValue | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<StringGenericValue> | StringGenericValue), options?: RequestHandlerOptions) => {
  return http.get('*/api/v1/Service/ping', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {await delay(1000);


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getPingResponseMock(),
      { status: 200
      })
  }, options)
}

export const getVersionMockHandler = (overrideResponse?: VersionInformation | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<VersionInformation> | VersionInformation), options?: RequestHandlerOptions) => {
  return http.get('*/api/v1/Service/version', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {await delay(1000);


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getVersionResponseMock(),
      { status: 200
      })
  }, options)
}
export const getServiceMock = () => [
  getPingMockHandler(),
  getVersionMockHandler()
]
