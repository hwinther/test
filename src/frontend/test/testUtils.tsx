import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'

interface IExtendedRenderOptions extends RenderOptions {
  //withRouter?: boolean
  //routerHistory?: string[]
  //withRedux?: boolean
  //mockAxiosCalls?: any
  mockAuthContext?: boolean | null
  //mockInitialState?: any
  withQueryProvider?: boolean | null
}

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
    // logger: {
    //   error: () => {},
    //   log: console.log,
    //   warn: console.warn,
    // },
  })

const wrapInQueryProvider = (componentTree: React.JSX.Element): React.JSX.Element => {
  const testQueryClient = createTestQueryClient()
  return <QueryClientProvider client={testQueryClient}>{componentTree}</QueryClientProvider>
}

const setupComponent = (ui: React.JSX.Element, renderOptions?: IExtendedRenderOptions): React.JSX.Element => {
  if (renderOptions == null) return ui
  let componentTree = ui
  //if (renderOptions.withRouter) componentTree = wrapInRouter(componentTree, renderOptions.routerHistory);
  //if (renderOptions.withRedux) componentTree = wrapInRedux(componentTree, renderOptions);
  if (renderOptions.withQueryProvider !== false) componentTree = wrapInQueryProvider(componentTree)
  if (renderOptions.mockAuthContext !== false) {
    // TODO: also remove it afterAll
    vi.mock('~/auth.context', () => ({
      useAuthDispatch: () => vi.fn(),
    }))
  }
  return componentTree
}

const customRender = (ui: React.JSX.Element, renderOptions?: IExtendedRenderOptions): ReturnType<typeof render> => {
  try {
    // mockAxiosCallResponsesIfAny(renderOptions)
    const componentTree = setupComponent(ui, renderOptions)
    return render(componentTree)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export * from '@testing-library/react'
//export { default as userEvent } from '@testing-library/user-event'
// override render export
export { type IExtendedRenderOptions, customRender as render }
