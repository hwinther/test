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
  RedisCounter
} from '../../models';


export const getGetCounterResponseMock = (overrideResponse: Partial<Extract<RedisCounter, object>> = {}): RedisCounter => ({value: faker.number.int(), ...overrideResponse})

export const getIncrementCounterResponseMock = (overrideResponse: Partial<Extract<RedisCounter, object>> = {}): RedisCounter => ({value: faker.number.int(), ...overrideResponse})

export const getResetCounterResponseMock = (overrideResponse: Partial<Extract<RedisCounter, object>> = {}): RedisCounter => ({value: faker.number.int(), ...overrideResponse})


export const getGetCounterMockHandler = (overrideResponse?: RedisCounter | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<RedisCounter> | RedisCounter), options?: RequestHandlerOptions) => {
  return http.get('*/api/v1/Redis/counter', async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {await delay(1000);


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getGetCounterResponseMock(),
      { status: 200
      })
  }, options)
}

export const getIncrementCounterMockHandler = (overrideResponse?: RedisCounter | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<RedisCounter> | RedisCounter), options?: RequestHandlerOptions) => {
  return http.post('*/api/v1/Redis/counter', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {await delay(1000);


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getIncrementCounterResponseMock(),
      { status: 200
      })
  }, options)
}

export const getResetCounterMockHandler = (overrideResponse?: RedisCounter | ((info: Parameters<Parameters<typeof http.delete>[1]>[0]) => Promise<RedisCounter> | RedisCounter), options?: RequestHandlerOptions) => {
  return http.delete('*/api/v1/Redis/counter', async (info: Parameters<Parameters<typeof http.delete>[1]>[0]) => {await delay(1000);


    return HttpResponse.json(overrideResponse !== undefined
    ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse)
    : getResetCounterResponseMock(),
      { status: 200
      })
  }, options)
}
export const getRedisMock = () => [
  getGetCounterMockHandler(),
  getIncrementCounterMockHandler(),
  getResetCounterMockHandler()
]
