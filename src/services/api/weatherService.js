import weatherData from '../mockData/weather.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class WeatherService {
  constructor() {
    this.weatherData = { ...weatherData };
  }

  async getForecast() {
    await delay(400);
    return { ...this.weatherData };
  }

  async getCurrentWeather() {
    await delay(200);
    return { ...this.weatherData.current };
  }
}

export default new WeatherService();