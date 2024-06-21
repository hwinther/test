import { type JSX, useEffect, useState } from 'react'

import './App.css'
import { useGetWeatherForecast } from './api/endpoints/weather-forecast/weather-forecast'
import { type WeatherForecast } from './api/models'
import reactLogo from './assets/react.svg'
import { useAuthDispatch } from './auth.context'

import viteLogo from '/vite.svg'

/**
 * This is the main component of the application.
 * @returns {JSX.Element} The rendered App component.
 */
function App(): JSX.Element {
  const [count, setCount] = useState(0)
  const dispatch = useAuthDispatch()
  const { data: weatherForecasts, refetch } = useGetWeatherForecast()

  useEffect(() => {
    dispatch('token')
    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      refetch()
    }, 2000)
  }, [refetch, dispatch])

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img alt="Vite logo" className="logo" src={viteLogo} />
        </a>
        <a href="https://react.dev" target="_blank">
          <img alt="React logo" className="logo react" src={reactLogo} />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button
          onClick={() => {
            setCount((count) => count + 1)
          }}
        >
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>

      {weatherForecasts?.map((wf: WeatherForecast) => (
        <p key={wf.date}>
          {wf.date}: {wf.summary} - {wf.temperatureC}
        </p>
      ))}
    </>
  )
}

export default App
