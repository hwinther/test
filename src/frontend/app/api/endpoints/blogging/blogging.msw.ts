//@ts-nocheck
import { faker } from '@faker-js/faker'

import { HttpResponse, delay, http } from 'msw'
import type { RequestHandlerOptions } from 'msw'

import type { BlogDto, PostDto } from '../../models'

export const getGetBlogsResponseMock = (): BlogDto[] =>
  Array.from({ length: faker.number.int({ min: 1, max: 10 }) }, (_, i) => i + 1).map(() => ({
    blogId: faker.helpers.arrayElement([faker.number.int(), undefined]),
    title: faker.helpers.arrayElement([
      faker.helpers.arrayElement([faker.string.alpha({ length: { min: 10, max: 20 } }), null]),
      null,
    ]),
    url: faker.helpers.arrayElement([
      faker.helpers.arrayElement([faker.string.alpha({ length: { min: 10, max: 20 } }), null]),
      null,
    ]),
  }))

export const getPostBlogResponseMock = (overrideResponse: Partial<Extract<BlogDto, object>> = {}): BlogDto => ({
  blogId: faker.helpers.arrayElement([faker.number.int(), undefined]),
  title: faker.helpers.arrayElement([
    faker.helpers.arrayElement([faker.string.alpha({ length: { min: 10, max: 20 } }), null]),
    null,
  ]),
  url: faker.helpers.arrayElement([
    faker.helpers.arrayElement([faker.string.alpha({ length: { min: 10, max: 20 } }), null]),
    null,
  ]),
  ...overrideResponse,
})

export const getGetBlogResponseMock = (overrideResponse: Partial<Extract<BlogDto, object>> = {}): BlogDto => ({
  blogId: faker.helpers.arrayElement([faker.number.int(), undefined]),
  title: faker.helpers.arrayElement([
    faker.helpers.arrayElement([faker.string.alpha({ length: { min: 10, max: 20 } }), null]),
    null,
  ]),
  url: faker.helpers.arrayElement([
    faker.helpers.arrayElement([faker.string.alpha({ length: { min: 10, max: 20 } }), null]),
    null,
  ]),
  ...overrideResponse,
})

export const getGetPostsResponseMock = (): PostDto[] =>
  Array.from({ length: faker.number.int({ min: 1, max: 10 }) }, (_, i) => i + 1).map(() => ({
    postId: faker.helpers.arrayElement([faker.number.int(), undefined]),
    title: faker.helpers.arrayElement([
      faker.helpers.arrayElement([faker.string.alpha({ length: { min: 10, max: 20 } }), null]),
      null,
    ]),
    content: faker.helpers.arrayElement([
      faker.helpers.arrayElement([faker.string.alpha({ length: { min: 10, max: 20 } }), null]),
      null,
    ]),
    blogId: faker.number.int(),
  }))

export const getGetPostResponseMock = (overrideResponse: Partial<Extract<PostDto, object>> = {}): PostDto => ({
  postId: faker.helpers.arrayElement([faker.number.int(), undefined]),
  title: faker.helpers.arrayElement([
    faker.helpers.arrayElement([faker.string.alpha({ length: { min: 10, max: 20 } }), null]),
    null,
  ]),
  content: faker.helpers.arrayElement([
    faker.helpers.arrayElement([faker.string.alpha({ length: { min: 10, max: 20 } }), null]),
    null,
  ]),
  blogId: faker.number.int(),
  ...overrideResponse,
})

export const getPostPostResponseMock = (overrideResponse: Partial<Extract<PostDto, object>> = {}): PostDto => ({
  postId: faker.helpers.arrayElement([faker.number.int(), undefined]),
  title: faker.helpers.arrayElement([
    faker.helpers.arrayElement([faker.string.alpha({ length: { min: 10, max: 20 } }), null]),
    null,
  ]),
  content: faker.helpers.arrayElement([
    faker.helpers.arrayElement([faker.string.alpha({ length: { min: 10, max: 20 } }), null]),
    null,
  ]),
  blogId: faker.number.int(),
  ...overrideResponse,
})

export const getGetBlogsMockHandler = (
  overrideResponse?:
    | BlogDto[]
    | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<BlogDto[]> | BlogDto[]),
  options?: RequestHandlerOptions,
) => {
  return http.get(
    '*/api/v1/Blogging/blog',
    async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {
      await delay(1000)

      return HttpResponse.json(
        overrideResponse !== undefined
          ? typeof overrideResponse === 'function'
            ? await overrideResponse(info)
            : overrideResponse
          : getGetBlogsResponseMock(),
        { status: 200 },
      )
    },
    options,
  )
}

export const getPostBlogMockHandler = (
  overrideResponse?: BlogDto | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<BlogDto> | BlogDto),
  options?: RequestHandlerOptions,
) => {
  return http.post(
    '*/api/v1/Blogging/blog',
    async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {
      await delay(1000)

      return HttpResponse.json(
        overrideResponse !== undefined
          ? typeof overrideResponse === 'function'
            ? await overrideResponse(info)
            : overrideResponse
          : getPostBlogResponseMock(),
        { status: 200 },
      )
    },
    options,
  )
}

export const getGetBlogMockHandler = (
  overrideResponse?: BlogDto | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<BlogDto> | BlogDto),
  options?: RequestHandlerOptions,
) => {
  return http.get(
    '*/api/v1/Blogging/blog/:id',
    async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {
      await delay(1000)

      return HttpResponse.json(
        overrideResponse !== undefined
          ? typeof overrideResponse === 'function'
            ? await overrideResponse(info)
            : overrideResponse
          : getGetBlogResponseMock(),
        { status: 200 },
      )
    },
    options,
  )
}

export const getGetPostsMockHandler = (
  overrideResponse?:
    | PostDto[]
    | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<PostDto[]> | PostDto[]),
  options?: RequestHandlerOptions,
) => {
  return http.get(
    '*/api/v1/Blogging/blog/:blogId/posts',
    async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {
      await delay(1000)

      return HttpResponse.json(
        overrideResponse !== undefined
          ? typeof overrideResponse === 'function'
            ? await overrideResponse(info)
            : overrideResponse
          : getGetPostsResponseMock(),
        { status: 200 },
      )
    },
    options,
  )
}

export const getGetPostMockHandler = (
  overrideResponse?: PostDto | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<PostDto> | PostDto),
  options?: RequestHandlerOptions,
) => {
  return http.get(
    '*/api/v1/Blogging/post/:id',
    async (info: Parameters<Parameters<typeof http.get>[1]>[0]) => {
      await delay(1000)

      return HttpResponse.json(
        overrideResponse !== undefined
          ? typeof overrideResponse === 'function'
            ? await overrideResponse(info)
            : overrideResponse
          : getGetPostResponseMock(),
        { status: 200 },
      )
    },
    options,
  )
}

export const getPostPostMockHandler = (
  overrideResponse?: PostDto | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<PostDto> | PostDto),
  options?: RequestHandlerOptions,
) => {
  return http.post(
    '*/api/v1/Blogging/post',
    async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {
      await delay(1000)

      return HttpResponse.json(
        overrideResponse !== undefined
          ? typeof overrideResponse === 'function'
            ? await overrideResponse(info)
            : overrideResponse
          : getPostPostResponseMock(),
        { status: 200 },
      )
    },
    options,
  )
}
export const getBloggingMock = () => [
  getGetBlogsMockHandler(),
  getPostBlogMockHandler(),
  getGetBlogMockHandler(),
  getGetPostsMockHandler(),
  getGetPostMockHandler(),
  getPostPostMockHandler(),
]
