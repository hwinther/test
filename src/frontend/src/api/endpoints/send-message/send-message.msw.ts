//@ts-nocheck
import { faker } from '@faker-js/faker'
import { HttpResponse, delay, http } from 'msw'

export const getGetSendMessageResponseMock = (): string => faker.word.sample()

export const getGetSendMessageMockHandler = () => {
  return http.get('*/SendMessage', async () => {
    await delay(1000)
    return new HttpResponse(getGetSendMessageResponseMock(), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  })
}
export const getSendMessageMock = () => [getGetSendMessageMockHandler()]
