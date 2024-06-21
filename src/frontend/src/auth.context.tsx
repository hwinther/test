import { type ReactNode, createContext, useContext, useState } from 'react'
type Dispatch = (Auth: string) => void

interface AuthProviderProps {
  children: ReactNode
  initialState?: null | string
}

const AuthContext = createContext<null | string>(null)
const AuthDispatchContext = createContext<Dispatch | null>(null)

const AuthProvider = ({ children, initialState = null }: AuthProviderProps): JSX.Element => {
  // it's a quick demo with useState but you can also have a more complex state with a useReducer
  const [token, setToken] = useState(initialState)

  return (
    <AuthContext.Provider value={token}>
      <AuthDispatchContext.Provider value={setToken}>{children}</AuthDispatchContext.Provider>
    </AuthContext.Provider>
  )
}

const useAuth = (): null | string => {
  return useContext<null | string>(AuthContext)
}

const useAuthDispatch = (): Dispatch => {
  const context = useContext<Dispatch | null>(AuthDispatchContext)

  if (context === null) {
    throw new Error('useAuthDispatch must be used within a AuthProvider')
  }
  return context
}

export { AuthProvider, useAuth, useAuthDispatch }
