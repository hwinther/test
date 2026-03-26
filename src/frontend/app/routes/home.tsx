import { type JSX, useEffect, useState } from 'react'

import type { WeatherForecast } from '~/api/models'
import type { SpriteTheme } from '~/components/game/mario/mario-types'

import { useVersion } from '~/api/endpoints/service/service'
import { useGetWeatherForecast } from '~/api/endpoints/weather-forecast/weather-forecast'
import { useAuthDispatch } from '~/auth.context'
import { LevelLoader } from '~/components/game/mario/level-loader'
import { MarioGame } from '~/components/game/mario/MarioGame'
import { MaritimeVentures } from '~/components/game/maritime-ventures/MaritimeVentures'
import { useKonamiCode } from '~/hooks/useKonamiCode'

/**
 * Home page with weather data, version info, and game launchers.
 * @returns {JSX.Element} The home page content.
 */
function Page(): JSX.Element {
  const [showGame, setShowGame] = useState(false)
  const [showMarioGame, setShowMarioGame] = useState(false)
  const [marioTheme, setMarioTheme] = useState<SpriteTheme>('classic')
  const dispatch = useAuthDispatch()
  const { data: weatherForecasts, refetch } = useGetWeatherForecast()
  const { data: version } = useVersion()
  const isKonamiActivated = useKonamiCode()

  useEffect(() => {
    dispatch('token')
    setTimeout(() => {
      refetch()
    }, 2000)
  }, [refetch, dispatch])

  if (isKonamiActivated) {
    return <MaritimeVentures />
  }

  if (showGame) {
    return <MaritimeVentures onClose={() => setShowGame(false)} />
  }

  if (showMarioGame) {
    return (
      <MarioGame levelSequence={LevelLoader.createDefaultLevelSequence()} onClose={() => setShowMarioGame(false)} spriteTheme={marioTheme} />
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Home</h1>

      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
          onClick={() => setShowGame(true)}
        >
          Play Maritime Ventures
        </button>
        <button
          className="rounded-lg bg-red-600 px-5 py-2.5 text-white font-medium hover:bg-red-700 transition-colors cursor-pointer"
          onClick={() => { setMarioTheme('classic'); setShowMarioGame(true) }}
        >
          Play Mario Clone
        </button>
        <button
          className="rounded-lg bg-purple-600 px-5 py-2.5 text-white font-medium hover:bg-purple-700 transition-colors cursor-pointer"
          onClick={() => { setMarioTheme('botvar'); setShowMarioGame(true) }}
        >
          Play Botvar Theme
        </button>
      </div>

      {weatherForecasts && weatherForecasts.length > 0 && (
        <section className="space-y-1">
          <h2 className="text-xl font-semibold">Weather Forecast</h2>
          {weatherForecasts.map((wf: WeatherForecast) => (
            <p key={wf.date} className="text-sm text-neutral-600 dark:text-neutral-400">
              {wf.date}: {wf.summary} – {wf.temperatureC}°C
            </p>
          ))}
        </section>
      )}

      {version !== undefined && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Version: {version?.informationalVersion} · Env: {version?.environmentName} · Mode: {import.meta.env.MODE}
        </p>
      )}
    </div>
  )
}

export default Page
