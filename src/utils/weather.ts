// weather.ts
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
}

export async function fetchWeather(): Promise<WeatherData | null> {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Kathmandu&appid=${WEATHER_API_KEY}&units=metric`
    );
    const data = await response.json();
    return {
      temperature: data.main.temp,
      condition: data.weather[0].description,
      location: data.name
    };
  } catch (err) {
    console.error('Error fetching weather:', err);
    return null;
  }
}
