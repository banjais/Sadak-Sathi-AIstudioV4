/**
 * This file now simulates fetching data from a weather API that includes alerts.
 * This is a mock implementation to demonstrate the feature without a real alerts API key.
 */

export interface WeatherAlert {
  id: string;
  severity: 'moderate' | 'severe';
  titleKey: string;
  descriptionKey: string;
}

export interface WeatherData {
  temperature: number; // in Celsius
  condition: 'Clear' | 'Clouds' | 'Rain' | 'Thunderstorm' | 'Snow' | 'Other';
  conditionKey: string;
  alerts: WeatherAlert[];
  windSpeed: number; // in km/h
  rainProbability: number; // in percentage (0-100)
  visibility: number; // in km
  pressure: number; // in hPa
}

// Maps our condition type to a translation key.
const mapConditionToKey = (condition: WeatherData['condition']): string => {
    const mapping: { [key in WeatherData['condition']]: string } = {
        Clear: 'weather_condition_clear',
        Clouds: 'weather_condition_clouds',
        Rain: 'weather_condition_rain',
        Thunderstorm: 'weather_condition_thunderstorm',
        Snow: 'weather_condition_snow',
        Other: 'weather_condition_other',
    };
    return mapping[condition];
};


export const fetchWeather = async (lat: number, lng: number): Promise<WeatherData | null> => {
    // This is a mock implementation.
    return new Promise((resolve) => {
        setTimeout(() => {
            // 50% chance of a severe weather alert for demonstration purposes.
            const shouldHaveAlert = Math.random() > 0.5;
            
            const mockAlerts: WeatherAlert[] = shouldHaveAlert ? [
                {
                    id: `alert-${Date.now()}`,
                    severity: 'severe',
                    titleKey: 'weather_alert_title_landslide',
                    descriptionKey: 'weather_alert_desc_landslide',
                }
            ] : [];

            const condition: WeatherData['condition'] = shouldHaveAlert ? 'Rain' : 'Clouds';

            const mockData: WeatherData = {
                temperature: 22 + (Math.random() * 5 - 2.5),
                condition,
                conditionKey: mapConditionToKey(condition),
                alerts: mockAlerts,
                windSpeed: 15 + (Math.random() * 10),
                rainProbability: shouldHaveAlert ? 80 : 30,
                visibility: shouldHaveAlert ? 4 : 10,
                pressure: 1012 + (Math.random() * 5),
            };

            resolve(mockData);
        }, 800);
    });
};
