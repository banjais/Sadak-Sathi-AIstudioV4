import { useEffect, useState } from 'react';
import { getWeather, WeatherData } from '../utils/weather';

export default function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Example coordinates: Kathmandu, Nepal
  const lat = 27.7172;
  const lon = 85.3240;

  useEffect(() => {
    async function fetchWeather() {
      try {
        const data = await getWeather(lat, lon);
        if (data) setWeather(data);
        else setError('All weather sources failed');
      } catch (err) {
        setError('Error fetching weather');
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, []);

  if (loading) return <div>Loading weather...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 bg-blue-100 rounded-md shadow-md max-w-sm">
      <h2 className="text-lg font-bold mb-2">Weather in Kathmandu</h2>
      <p>Temperature: {weather?.temperature}°C</p>
      <p>Condition: {weather?.description}</p>
      <p className="text-sm text-gray-600">Source: {weather?.source}</p>
    </div>
  );
}
