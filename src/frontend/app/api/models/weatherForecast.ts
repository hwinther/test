//@ts-nocheck

/**
 * Weather forecast model
 */
export interface WeatherForecast {
  /** Date of forecast */
  date?: string
  /** Temperature in celsius */
  temperatureC?: number
  /**
   * Summary text
   * @nullable
   */
  summary?: string | null
}
