export type WeatherType = 'clear' | 'cloudy' | 'rain' | 'wind' | 'snow';

export interface Weather {
  readonly type: WeatherType;
  /** 0–100 intensity. */
  readonly intensity: number;
  /** Optional wind direction radians — data only. */
  readonly windDirection: number;
  readonly windSpeed: number;
}

export function createWeather(partial?: Partial<Weather>): Weather {
  return Object.freeze({
    type: partial?.type ?? 'clear',
    intensity: partial?.intensity ?? 0,
    windDirection: partial?.windDirection ?? 0,
    windSpeed: partial?.windSpeed ?? 0,
  });
}
