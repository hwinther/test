//@ts-nocheck
import {
  HttpResponse,
  delay,
  http
} from 'msw';
import type {
  RequestHandlerOptions
} from 'msw';



export const getPostApiV1ChatMessagesMockHandler = (overrideResponse?: unknown | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<unknown> | unknown), options?: RequestHandlerOptions) => {
  return http.post('*/api/v1/Chat/messages', async (info: Parameters<Parameters<typeof http.post>[1]>[0]) => {await delay(1000);
  if (typeof overrideResponse === 'function') {await overrideResponse(info); }

    return new HttpResponse(null,
      { status: 200
      })
  }, options)
}
export const getChatMock = () => [
  getPostApiV1ChatMessagesMockHandler()
]
