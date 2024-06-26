import Axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

export const AXIOS_INSTANCE = Axios.create({
  baseURL: 'https://localhost:7156/',
})

export const customInstance = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = Axios.CancelToken.source()
  const promise = AXIOS_INSTANCE({ ...config, cancelToken: source.token }).then(({ data }) => data)

  // @ts-expect-error cancel is not in the type definition
  promise.cancel = () => {
    source.cancel('Query was cancelled by Vue Query')
  }

  return await promise
}

export default customInstance

export interface ErrorType<Error> extends AxiosError<Error> {}
