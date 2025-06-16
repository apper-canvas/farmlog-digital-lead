import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, addDays } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import { weatherService } from '@/services';

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWeather();
  }, []);

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

  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return 'Sun';
      case 'partly cloudy': return 'CloudSun';
      case 'overcast': return 'Cloud';
      case 'light rain': return 'CloudRain';
      case 'rain': return 'CloudRain';
      case 'heavy rain': return 'CloudRain';
      case 'thunderstorm': return 'Zap';
      case 'snow': return 'Snowflake';
      default: return 'Sun';
    }
  };

  const getWeatherAdvice = (day) => {
    const advice = [];
    
    if (day.precipitation > 70) {
      advice.push({ text: 'Heavy rain expected - avoid field work', type: 'warning' });
    } else if (day.precipitation > 40) {
      advice.push({ text: 'Rain likely - plan indoor activities', type: 'info' });
    } else if (day.precipitation < 10 && day.high > 85) {
      advice.push({ text: 'Hot and dry - increase irrigation', type: 'warning' });
    }
    
    if (day.windSpeed > 20) {
      advice.push({ text: 'High winds - secure equipment', type: 'warning' });
    }
    
    if (day.high > 90) {
      advice.push({ text: 'Extreme heat - protect livestock', type: 'error' });
    } else if (day.high < 32) {
      advice.push({ text: 'Freezing temperatures - protect plants', type: 'error' });
    }
    
    if (advice.length === 0) {
      if (day.precipitation < 20 && day.high > 60 && day.high < 80) {
        advice.push({ text: 'Good conditions for fieldwork', type: 'success' });
      }
    }
    
    return advice;
  };

  const getConditionGradient = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return 'from-yellow-400 to-orange-400';
      case 'partly cloudy': return 'from-blue-400 to-gray-400';
      case 'overcast': return 'from-gray-400 to-gray-600';
      case 'light rain': return 'from-blue-500 to-blue-700';
      case 'rain': return 'from-blue-600 to-blue-800';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse mb-6">
          <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
        <SkeletonLoader count={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={loadWeather} />
      </div>
    );
  }

  const { current, forecast } = weather;

  return (
    <div className="p-6 max-w-full overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-display font-bold text-gray-900">Weather</h1>
        <p className="text-gray-600 mt-1">
          Agricultural weather forecast and farming recommendations
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Current Weather */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <div className={`bg-gradient-to-r ${getConditionGradient(current.condition)} p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold mb-2">Current Conditions</h2>
                  <p className="text-white/90">Right now</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold mb-2">{current.temperature}°F</div>
                  <div className="flex items-center justify-end">
                    <ApperIcon name={getWeatherIcon(current.condition)} size={24} className="mr-2" />
                    <span>{current.condition}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <ApperIcon name="Droplets" size={24} className="text-blue-500 mx-auto mb-2" />
                  <div className="font-medium text-gray-900">{current.humidity}%</div>
                  <div className="text-sm text-gray-600">Humidity</div>
                </div>
                
                <div className="text-center">
                  <ApperIcon name="Wind" size={24} className="text-gray-500 mx-auto mb-2" />
                  <div className="font-medium text-gray-900">{current.windSpeed} mph</div>
                  <div className="text-sm text-gray-600">Wind Speed</div>
                </div>
                
                <div className="text-center">
                  <ApperIcon name="CloudRain" size={24} className="text-blue-500 mx-auto mb-2" />
                  <div className="font-medium text-gray-900">{current.precipitation}%</div>
                  <div className="text-sm text-gray-600">Chance of Rain</div>
                </div>
                
                <div className="text-center">
                  <ApperIcon name="Eye" size={24} className="text-green-500 mx-auto mb-2" />
                  <div className="font-medium text-gray-900">Good</div>
                  <div className="text-sm text-gray-600">Visibility</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 5-Day Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-display font-semibold text-gray-900">5-Day Forecast</h2>
              <p className="text-gray-600 mt-1">Plan your farming activities ahead</p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {forecast.map((day, index) => {
                const dayAdvice = getWeatherAdvice(day);
                const isToday = index === 0;
                
                return (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 bg-gradient-to-br ${getConditionGradient(day.condition)} rounded-full flex items-center justify-center`}>
                          <ApperIcon name={getWeatherIcon(day.condition)} size={28} className="text-white" />
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {isToday ? 'Today' : format(new Date(day.date), 'EEEE')}
                          </h3>
                          <p className="text-sm text-gray-600">{format(new Date(day.date), 'MMM d')}</p>
                          <p className="text-sm text-gray-600">{day.condition}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {day.high}°<span className="text-lg text-gray-600">/{day.low}°</span>
                        </div>
                        <div className="text-sm text-blue-600 mt-1">
                          {day.precipitation}% rain
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div className="flex items-center">
                        <ApperIcon name="Droplets" size={16} className="text-blue-500 mr-2" />
                        <span>{day.humidity}% humidity</span>
                      </div>
                      
                      <div className="flex items-center">
                        <ApperIcon name="Wind" size={16} className="text-gray-500 mr-2" />
                        <span>{day.windSpeed} mph wind</span>
                      </div>
                      
                      <div className="flex items-center">
                        <ApperIcon name="Thermometer" size={16} className="text-orange-500 mr-2" />
                        <span>High {day.high}°F</span>
                      </div>
                      
                      <div className="flex items-center">
                        <ApperIcon name="CloudRain" size={16} className="text-blue-500 mr-2" />
                        <span>{day.precipitation}% precipitation</span>
                      </div>
                    </div>
                    
                    {dayAdvice.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 text-sm">Farming Recommendations:</h4>
                        <div className="flex flex-wrap gap-2">
                          {dayAdvice.map((advice, adviceIndex) => (
                            <Badge 
                              key={adviceIndex}
                              variant={advice.type}
                              className="text-xs"
                            >
                              {advice.text}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Weather Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-display font-semibold text-gray-900 mb-4">
                Agricultural Weather Tips
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <ApperIcon name="Sprout" size={18} className="text-secondary mr-2" />
                    Planting Conditions
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Soil temperature should be 50°F+ for most crops</li>
                    <li>• Avoid planting before heavy rain periods</li>
                    <li>• Wind speeds under 15 mph ideal for seeding</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <ApperIcon name="Droplets" size={18} className="text-blue-500 mr-2" />
                    Irrigation Planning
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Water early morning to reduce evaporation</li>
                    <li>• Skip irrigation if rain is forecast within 24h</li>
                    <li>• Monitor soil moisture after rain events</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <ApperIcon name="Scissors" size={18} className="text-accent mr-2" />
                    Harvesting Weather
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Harvest during dry periods when possible</li>
                    <li>• Avoid harvesting with morning dew present</li>
                    <li>• Check 3-day forecast before starting harvest</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <ApperIcon name="Shield" size={18} className="text-error mr-2" />
                    Weather Alerts
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Protect sensitive crops from frost</li>
                    <li>• Secure equipment before high winds</li>
                    <li>• Monitor livestock during extreme temperatures</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Weather;