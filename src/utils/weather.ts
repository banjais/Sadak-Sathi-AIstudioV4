// /src/utils/weather.ts
import axios from 'axios';

type WeatherData = {
  temperature: number;
  description: string;
  source: string;
};

const openWeatherApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
const weatherApiKey = import.meta.env.VITE_WEATHER_API_KEY;
const openMeteoUrl = import.meta.env.VITE_OPENMETEO_API_KEY; // if Open-Meteo requires key

/**
 * Fetch weather for given latitude/longitude.
 */
export async function getWeather(lat: number, lon: number): Promise<WeatherData> {
  const sources = [
    async () => {
      if (!openWeatherApiKey) return null;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`;
      const res = await axios.get(url);
      return {
        temperature: res.data.main.temp,
        description: res.data.weather[0].description,
        source: 'OpenWeather',
      } as WeatherData;
    },
    async () => {
      if (!weatherApiKey) return null;
      const url = `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${lat},${lon}`;
      const res = await axios.get(url);
      return {
        temperature: res.data.current.temp_c,
        description: res.data.current.condition.text,
        source: 'WeatherAPI',
      } as WeatherData;
    },
    async () => {
      // Open-Meteo API example (no key required for basic usage)
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
      const res = await axios.get(url);
      return {
        temperature: res.data.current_weather.temperature,
        description: 'Current weather',
        source: 'Open-Meteo',
      } as WeatherData;
    },
  ];

  for (const fetcher of sources) {
    try {
      const data = await fetcher();
      if (data) return data;
    } catch (e) {
      // Fail silently and try next
      console.warn('Weather source failed:', e);
    }
  }

  throw new Error('All weather sources failed.');
}
