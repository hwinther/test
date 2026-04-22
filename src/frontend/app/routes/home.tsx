import { type JSX, useEffect, useState } from 'react'

import type { VersionInformation, WeatherForecast } from '~/api/models'
import type { SpriteTheme } from '~/components/game/mario/mario-types'

import { useVersion } from '~/api/endpoints/service/service'
import { useGetWeatherForecast } from '~/api/endpoints/weather-forecast/weather-forecast'
import { LevelLoader } from '~/components/game/mario/level-loader'
import { MarioGame } from '~/components/game/mario/MarioGame'
import { MaritimeVentures } from '~/components/game/maritime-ventures/MaritimeVentures'
import { useKonamiCode } from '~/hooks/useKonamiCode'

/**
 * Query payload may be a JSON array (actual axios body) or Orval's typed `{ status, data }` envelope.
 * @param {unknown} data Raw react-query data from getWeatherForecast.
 * @returns {WeatherForecast[] | undefined} Parsed rows or undefined.
 */
function weatherRowsFromQuery(data: unknown): WeatherForecast[] | undefined {
  if (data == null) return undefined
  if (Array.isArray(data)) return data as WeatherForecast[]
  const o = data as unknown as { status?: number; data?: unknown }
  if (o.status === 200 && Array.isArray(o.data)) return o.data as WeatherForecast[]
  return undefined
}

/**
 * Same shape mismatch as weather: mutator returns JSON body; Orval types may use `{ status, data }`.
 * @param {unknown} data Raw react-query data from version().
 * @returns {VersionInformation | undefined} Parsed version payload or undefined.
 */
function versionInfoFromQuery(data: unknown): VersionInformation | undefined {
  if (data == null) return undefined
  if (typeof data === 'object' && 'informationalVersion' in data) return data as VersionInformation
  const o = data as unknown as { status?: number; data?: unknown }
  if (o.status === 200 && o.data != null && typeof o.data === 'object' && 'informationalVersion' in o.data) {
    return o.data as VersionInformation
  }
  return undefined
}

/**
 * Home page with weather data, version info, and game launchers.
 * @returns {JSX.Element} The home page content.
 */
function Page(): JSX.Element {
  const [showGame, setShowGame] = useState(false)
  const [showMarioGame, setShowMarioGame] = useState(false)
  const [marioTheme, setMarioTheme] = useState<SpriteTheme>('classic')
  const { data: weatherForecasts, refetch } = useGetWeatherForecast()
  const forecastRows = weatherRowsFromQuery(weatherForecasts)
  const { data: versionRaw } = useVersion()
  const versionInfo = versionInfoFromQuery(versionRaw)
  const isKonamiActivated = useKonamiCode()

  useEffect(() => {
    setTimeout(() => {
      void refetch()
    }, 2000)
  }, [refetch])

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

      {forecastRows != null && forecastRows.length > 0 ? (
        <section className="space-y-1">
          <h2 className="text-xl font-semibold">Weather Forecast</h2>
          {forecastRows.map((wf: WeatherForecast) => (
            <p key={wf.date} className="text-sm text-neutral-600 dark:text-neutral-400">
              {wf.date}: {wf.summary} – {wf.temperatureC}°C
            </p>
          ))}
        </section>
      ) : null}

      {versionInfo != null && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Version: {versionInfo.informationalVersion} · Env: {versionInfo.environmentName} · Mode: {import.meta.env.MODE}
        </p>
      )}
    </div>
  )
}

export default Page
