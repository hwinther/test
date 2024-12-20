import React from 'react'
import { createContext, type ReactNode, useContext, useState } from 'react'
interface AuthProviderProps {
  children: ReactNode
  initialState?: null | string
}

type Dispatch = (Auth: string) => void

const AuthContext = createContext<null | string>(null)
const AuthDispatchContext = createContext<Dispatch | null>(null)

const AuthProvider = ({ children, initialState = null }: AuthProviderProps): React.JSX.Element => {
  // it's a quick demo with useState but you can also have a more complex state with a useReducer
  const [token, setToken] = useState(initialState)

  return (
    <AuthContext.Provider value={token}>
      <AuthDispatchContext.Provider value={setToken}>{children}</AuthDispatchContext.Provider>
    </AuthContext.Provider>
  )
}

const useAuth = (): null | string => useContext<null | string>(AuthContext)

const useAuthDispatch = (): Dispatch => {
  const context = useContext<Dispatch | null>(AuthDispatchContext)

  if (context === null) {
    throw new Error('useAuthDispatch must be used within a AuthProvider')
  }
  return context
}

export { AuthProvider, useAuth, useAuthDispatch }
