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
  StringGenericValue
} from '../../models';


export const getGetApiV1SendMessageResponseMock = (overrideResponse: Partial<Extract<StringGenericValue, object>> = {}): StringGenericValue => ({value: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.string.alpha({length: {min: 10, max: 20}}), null]), null]), ...overrideResponse})


export const getGetApiV1SendMessageMockHandler = (overrideResponse?: StringGenericValue | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<StringGenericValue> | StringGenericValue), options?: RequestHandlerOptions) => {
  return http.get('*/api/v1/SendMessage', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {await delay(1000);


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetApiV1SendMessageResponseMock(),
      { status: 200
      })
  }, options)
}
export const getSendMessageMock = () => [
  getGetApiV1SendMessageMockHandler()
]
