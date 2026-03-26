//@ts-nocheck

/**
 * Weather forecast model
 */
export interface WeatherForecast {
  /** Date of forecast */
  date?: string
  /**
   * Summary text
   * @nullable
   */
  summary?: string | null
  /** Temperature in celsius */
  temperatureC?: number
}
