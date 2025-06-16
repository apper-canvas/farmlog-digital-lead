import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import { weatherService } from '@/services';

const WeatherWidget = ({ className = '' }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const weatherData = await weatherService.getForecast();
        setWeather(weatherData);
      } catch (err) {
        setError(err.message || 'Failed to load weather data');
      } finally {
        setLoading(false);
      }
    };

    loadWeather();
  }, []);

  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return 'Sun';
      case 'partly cloudy': return 'CloudSun';
      case 'overcast': return 'Cloud';
      case 'light rain': return 'CloudRain';
      case 'rain': return 'CloudRain';
      default: return 'Sun';
    }
  };

  if (loading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <div className="text-center py-4">
          <ApperIcon name="CloudOff" size={32} className="text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Weather unavailable</p>
        </div>
      </Card>
    );
  }

  const { current, forecast } = weather;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-lg">Weather</h3>
            <div className="text-xs text-gray-500">Now</div>
          </div>
          
          {/* Current Weather */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
              <ApperIcon name={getWeatherIcon(current.condition)} size={32} className="text-blue-600" />
            </div>
            
            <div className="flex-1">
              <div className="text-3xl font-bold text-gray-900">{current.temperature}°F</div>
              <div className="text-sm text-gray-600">{current.condition}</div>
            </div>
          </div>
          
          {/* Current Conditions */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <ApperIcon name="Droplets" size={16} className="text-blue-500 mx-auto mb-1" />
              <div className="text-xs text-gray-500">Humidity</div>
              <div className="text-sm font-medium">{current.humidity}%</div>
            </div>
            
            <div className="text-center">
              <ApperIcon name="Wind" size={16} className="text-gray-500 mx-auto mb-1" />
              <div className="text-xs text-gray-500">Wind</div>
              <div className="text-sm font-medium">{current.windSpeed} mph</div>
            </div>
            
            <div className="text-center">
              <ApperIcon name="CloudRain" size={16} className="text-blue-500 mx-auto mb-1" />
              <div className="text-xs text-gray-500">Rain</div>
              <div className="text-sm font-medium">{current.precipitation}%</div>
            </div>
          </div>
          
          {/* 5-Day Forecast */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h4 className="font-medium text-gray-900">5-Day Forecast</h4>
            
            <div className="space-y-2">
              {forecast.slice(0, 3).map((day, index) => (
                <div key={day.date} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <ApperIcon name={getWeatherIcon(day.condition)} size={20} className="text-gray-600" />
                    <div>
                      <div className="text-sm font-medium">
                        {index === 0 ? 'Today' : format(new Date(day.date), 'EEE')}
                      </div>
                      <div className="text-xs text-gray-500">{day.condition}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium">{day.high}°/{day.low}°</div>
                    <div className="text-xs text-blue-600">{day.precipitation}% rain</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default WeatherWidget;