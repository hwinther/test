//@ts-nocheck
import { faker } from '@faker-js/faker'
import { HttpResponse, delay, http } from 'msw'

export const getGetBlogsResponseMock = (): Blog[] =>
  Array.from({ length: faker.number.int({ min: 1, max: 10 }) }, (_, i) => i + 1).map(() => ({
    blogId: faker.helpers.arrayElement([faker.number.int({ min: undefined, max: undefined }), undefined]),
    posts: faker.helpers.arrayElement([
      Array.from({ length: faker.number.int({ min: 1, max: 10 }) }, (_, i) => i + 1).map(() => ({
        blogId: faker.helpers.arrayElement([faker.number.int({ min: undefined, max: undefined }), undefined]),
        content: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.word.sample(), null]), undefined]),
        postId: faker.helpers.arrayElement([faker.number.int({ min: undefined, max: undefined }), undefined]),
        title: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.word.sample(), null]), undefined]),
      })),
      undefined,
    ]),
    url: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.word.sample(), null]), undefined]),
  }))

export const getPostBlogResponseMock = (overrideResponse: Partial<Blog> = {}): Blog => ({
  blogId: faker.helpers.arrayElement([faker.number.int({ min: undefined, max: undefined }), undefined]),
  posts: faker.helpers.arrayElement([
    Array.from({ length: faker.number.int({ min: 1, max: 10 }) }, (_, i) => i + 1).map(() => ({
      blog: faker.helpers.arrayElement([
        {
          blogId: faker.helpers.arrayElement([faker.number.int({ min: undefined, max: undefined }), undefined]),
          posts: faker.helpers.arrayElement([[], undefined]),
          url: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.word.sample(), null]), undefined]),
        },
        undefined,
      ]),
      blogId: faker.helpers.arrayElement([faker.number.int({ min: undefined, max: undefined }), undefined]),
      content: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.word.sample(), null]), undefined]),
      postId: faker.helpers.arrayElement([faker.number.int({ min: undefined, max: undefined }), undefined]),
      title: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.word.sample(), null]), undefined]),
    })),
    undefined,
  ]),
  url: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.word.sample(), null]), undefined]),
  ...overrideResponse,
})

export const getGetPostsResponseMock = (): Post[] =>
  Array.from({ length: faker.number.int({ min: 1, max: 10 }) }, (_, i) => i + 1).map(() => ({
    blog: faker.helpers.arrayElement([
      {
        blogId: faker.helpers.arrayElement([faker.number.int({ min: undefined, max: undefined }), undefined]),
        posts: faker.helpers.arrayElement([[], undefined]),
        url: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.word.sample(), null]), undefined]),
      },
      undefined,
    ]),
    blogId: faker.helpers.arrayElement([faker.number.int({ min: undefined, max: undefined }), undefined]),
    content: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.word.sample(), null]), undefined]),
    postId: faker.helpers.arrayElement([faker.number.int({ min: undefined, max: undefined }), undefined]),
    title: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.word.sample(), null]), undefined]),
  }))

export const getPostPostResponseMock = (overrideResponse: Partial<Post> = {}): Post => ({
  blog: faker.helpers.arrayElement([
    {
      blogId: faker.helpers.arrayElement([faker.number.int({ min: undefined, max: undefined }), undefined]),
      posts: faker.helpers.arrayElement([
        Array.from({ length: faker.number.int({ min: 1, max: 10 }) }, (_, i) => i + 1).map(() => ({
          blogId: faker.helpers.arrayElement([faker.number.int({ min: undefined, max: undefined }), undefined]),
          content: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.word.sample(), null]), undefined]),
          postId: faker.helpers.arrayElement([faker.number.int({ min: undefined, max: undefined }), undefined]),
          title: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.word.sample(), null]), undefined]),
        })),
        undefined,
      ]),
      url: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.word.sample(), null]), undefined]),
    },
    undefined,
  ]),
  blogId: faker.helpers.arrayElement([faker.number.int({ min: undefined, max: undefined }), undefined]),
  content: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.word.sample(), null]), undefined]),
  postId: faker.helpers.arrayElement([faker.number.int({ min: undefined, max: undefined }), undefined]),
  title: faker.helpers.arrayElement([faker.helpers.arrayElement([faker.word.sample(), null]), undefined]),
  ...overrideResponse,
})

export const getGetBlogsMockHandler = () => {
  return http.get('*/Blogging/Blog', async () => {
    await delay(1000)
    return new HttpResponse(getGetBlogsResponseMock(), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  })
}

export const getPostBlogMockHandler = () => {
  return http.post('*/Blogging/Blog', async () => {
    await delay(1000)
    return new HttpResponse(getPostBlogResponseMock(), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  })
}

export const getGetPostsMockHandler = () => {
  return http.get('*/Blogging/Post', async () => {
    await delay(1000)
    return new HttpResponse(getGetPostsResponseMock(), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  })
}

export const getPostPostMockHandler = () => {
  return http.post('*/Blogging/Post', async () => {
    await delay(1000)
    return new HttpResponse(getPostPostResponseMock(), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  })
}
export const getBloggingMock = () => [
  getGetBlogsMockHandler(),
  getPostBlogMockHandler(),
  getGetPostsMockHandler(),
  getPostPostMockHandler(),
]
