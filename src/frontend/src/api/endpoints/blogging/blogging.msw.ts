//@ts-nocheck
import { faker } from '@faker-js/faker'
import { HttpResponse, delay, http } from 'msw'
import type { BlogDto, PostDto } from '../../models'

export const getGetBlogsResponseMock = (): BlogDto[] =>
  Array.from({ length: faker.number.int({ min: 1, max: 10 }) }, (_, i) => i + 1).map(() => ({
    blogId: faker.helpers.arrayElement([faker.number.int({ min: undefined, max: undefined }), undefined]),
    url: faker.helpers.arrayElement([faker.word.sample(), null]),
  }))

export const getPostBlogResponseMock = (overrideResponse: Partial<BlogDto> = {}): BlogDto => ({
  blogId: faker.helpers.arrayElement([faker.number.int({ min: undefined, max: undefined }), undefined]),
  url: faker.helpers.arrayElement([faker.word.sample(), null]),
  ...overrideResponse,
})

export const getGetBlogResponseMock = (overrideResponse: Partial<BlogDto> = {}): BlogDto => ({
  blogId: faker.helpers.arrayElement([faker.number.int({ min: undefined, max: undefined }), undefined]),
  url: faker.helpers.arrayElement([faker.word.sample(), null]),
  ...overrideResponse,
})

export const getGetPostsResponseMock = (): PostDto[] =>
  Array.from({ length: faker.number.int({ min: 1, max: 10 }) }, (_, i) => i + 1).map(() => ({
    blogId: faker.number.int({ min: undefined, max: undefined }),
    content: faker.helpers.arrayElement([faker.word.sample(), null]),
    postId: faker.helpers.arrayElement([faker.number.int({ min: undefined, max: undefined }), undefined]),
    title: faker.helpers.arrayElement([faker.word.sample(), null]),
  }))

export const getGetPostResponseMock = (overrideResponse: Partial<PostDto> = {}): PostDto => ({
  blogId: faker.number.int({ min: undefined, max: undefined }),
  content: faker.helpers.arrayElement([faker.word.sample(), null]),
  postId: faker.helpers.arrayElement([faker.number.int({ min: undefined, max: undefined }), undefined]),
  title: faker.helpers.arrayElement([faker.word.sample(), null]),
  ...overrideResponse,
})

export const getPostPostResponseMock = (overrideResponse: Partial<PostDto> = {}): PostDto => ({
  blogId: faker.number.int({ min: undefined, max: undefined }),
  content: faker.helpers.arrayElement([faker.word.sample(), null]),
  postId: faker.helpers.arrayElement([faker.number.int({ min: undefined, max: undefined }), undefined]),
  title: faker.helpers.arrayElement([faker.word.sample(), null]),
  ...overrideResponse,
})

export const getGetBlogsMockHandler = (
  overrideResponse?:
    | BlogDto[]
    | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<BlogDto[]> | BlogDto[]),
) => {
  return http.get('*/Blogging/blog', async (info) => {
    await delay(1000)
    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === 'function'
            ? await overrideResponse(info)
            : overrideResponse
          : getGetBlogsResponseMock(),
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

export const getPostBlogMockHandler = (
  overrideResponse?: BlogDto | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<BlogDto> | BlogDto),
) => {
  return http.post('*/Blogging/blog', async (info) => {
    await delay(1000)
    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === 'function'
            ? await overrideResponse(info)
            : overrideResponse
          : getPostBlogResponseMock(),
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

export const getGetBlogMockHandler = (
  overrideResponse?: BlogDto | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<BlogDto> | BlogDto),
) => {
  return http.get('*/Blogging/blog/:id', async (info) => {
    await delay(1000)
    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === 'function'
            ? await overrideResponse(info)
            : overrideResponse
          : getGetBlogResponseMock(),
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

export const getGetPostsMockHandler = (
  overrideResponse?:
    | PostDto[]
    | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<PostDto[]> | PostDto[]),
) => {
  return http.get('*/Blogging/blog/:blogId/posts', async (info) => {
    await delay(1000)
    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === 'function'
            ? await overrideResponse(info)
            : overrideResponse
          : getGetPostsResponseMock(),
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

export const getGetPostMockHandler = (
  overrideResponse?: PostDto | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<PostDto> | PostDto),
) => {
  return http.get('*/Blogging/post/:id', async (info) => {
    await delay(1000)
    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === 'function'
            ? await overrideResponse(info)
            : overrideResponse
          : getGetPostResponseMock(),
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

export const getPostPostMockHandler = (
  overrideResponse?: PostDto | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<PostDto> | PostDto),
) => {
  return http.post('*/Blogging/post', async (info) => {
    await delay(1000)
    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === 'function'
            ? await overrideResponse(info)
            : overrideResponse
          : getPostPostResponseMock(),
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
export const getBloggingMock = () => [
  getGetBlogsMockHandler(),
  getPostBlogMockHandler(),
  getGetBlogMockHandler(),
  getGetPostsMockHandler(),
  getGetPostMockHandler(),
  getPostPostMockHandler(),
]
