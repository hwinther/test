//@ts-nocheck
import { faker } from '@faker-js/faker'
import { HttpResponse, delay, http } from 'msw'

export const getGetSendMessageResponseMock = (): string => faker.word.sample()

export const getGetSendMessageMockHandler = (
  overrideResponse?: string | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<string> | string),
) => {
  return http.get('*/SendMessage', async (info) => {
    await delay(1000)
    return new HttpResponse(
      JSON.stringify(
        overrideResponse !== undefined
          ? typeof overrideResponse === 'function'
            ? await overrideResponse(info)
            : overrideResponse
          : getGetSendMessageResponseMock(),
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
export const getSendMessageMock = () => [getGetSendMessageMockHandler()]
