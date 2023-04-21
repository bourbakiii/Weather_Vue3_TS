export type City = {
  id: string,
  name: string,
  geo_lat: string,
  geo_lon: string,
  weather?: Weather
};




export type Weather = {
  feels_like: number,
  humidity: number,
  sea_level: number,
  pressure: number,
  temperature: {
    current: number,
    minimum: number,
    maximum: number
  },
  sunset: Date,
  sunrise: Date,
  icon: string,
  description: string,
  main: string,
  wind: {
    deg: number,
    gust: number,
    speed: number
  }
}