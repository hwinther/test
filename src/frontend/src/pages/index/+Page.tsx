import { type JSX, useEffect, useState } from 'react'

import type { WeatherForecast } from '~/api/models'

import { useVersion } from '~/api/endpoints/service/service'
import { useGetWeatherForecast } from '~/api/endpoints/weather-forecast/weather-forecast'
import reactLogo from '~/assets/react.svg'
import { useAuthDispatch } from '~/auth.context'
import { MarioGame } from '~/components/game/mario/MarioGame'
import { MaritimeVentures } from '~/components/game/maritime-ventures/MaritimeVentures'
// import { useKonamiCode } from '~/hooks/useKonamiCode'

import './Page.css'

import viteLogo from '/vite.svg'

/**
 * This is the main component of the application.
 * @returns {JSX.Element} The rendered Page component.
 */
function Page(): JSX.Element {
  const [count, setCount] = useState(0)
  const [showGame, setShowGame] = useState(false)
  const [showMarioGame, setShowMarioGame] = useState(false)
  const dispatch = useAuthDispatch()
  const { data: weatherForecasts, refetch } = useGetWeatherForecast()
  const { data: version } = useVersion()
  // const isKonamiActivated = useKonamiCode()

  useEffect(() => {
    dispatch('token')
    setTimeout(() => {
      refetch()
    }, 2000)
  }, [refetch, dispatch])

  // Show the Easter egg game if manually activated
  // if (isKonamiActivated) {
  //   return <MaritimeVentures />
  // }
  
  if (showGame) {
    return <MaritimeVentures onClose={() => setShowGame(false)} />
  }

  if (showMarioGame) {
    return <MarioGame onClose={() => setShowMarioGame(false)} />
  }

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
        <button
          onClick={() => {
            setShowGame(true)
          }}
          style={{ 
            background: '#4a90e2',
            border: 'none',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer',
            marginLeft: '10px',
            padding: '10px 20px'
          }}
        >
          🚢 Play Maritime Ventures
        </button>
        <button
          onClick={() => {
            setShowMarioGame(true)
          }}
          style={{ 
            background: '#e24a4a',
            border: 'none',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer',
            marginLeft: '10px',
            padding: '10px 20px'
          }}
        >
          🍄 Play Mario Clone
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

      {version !== undefined && (
        <p style={{ fontSize: '0.7em' }}>
          Version: {version?.informationalVersion} Env: {version?.environmentName} Mode: {import.meta.env.MODE}
        </p>
      )}
    </>
  )
}

export default Page
