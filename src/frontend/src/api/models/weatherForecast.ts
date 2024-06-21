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
  summary?: null | string
  /** Temperature in celsius */
  temperatureC?: number
}
