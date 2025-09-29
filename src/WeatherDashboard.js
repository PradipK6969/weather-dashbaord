// WeatherDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WeatherDashboard.css';

const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [city, setCity] = useState('New York');

  const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY; // Replace with your API key
  const BASE_URL = 'https://api.openweathermap.org/data/2.5';

  useEffect(() => {
    fetchWeatherData();
  }, [city]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch current weather
      const currentResponse = await axios.get(
        `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
      );

      // Fetch 5-day forecast
      const forecastResponse = await axios.get(
        `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );

      setWeatherData(currentResponse.data);
      setForecastData(forecastResponse.data);
    } catch (err) {
      setError('Failed to fetch weather data. Please check the city name.');
      console.error('Error fetching weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getHourlyForecast = () => {
    if (!forecastData) return [];
    return forecastData.list.slice(0, 8); // Next 24 hours (3-hour intervals)
  };

  const getDailyForecast = () => {
    if (!forecastData) return [];
    
    const dailyData = {};
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!dailyData[date]) {
        dailyData[date] = item;
      }
    });
    
    return Object.values(dailyData).slice(0, 7); // Next 7 days
  };

  if (loading) {
    return (
      <div className={`weather-dashboard ${darkMode ? 'dark' : 'light'}`}>
        <div className="loading">Loading weather data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`weather-dashboard ${darkMode ? 'dark' : 'light'}`}>
        <div className="error">{error}</div>
        <button onClick={() => setCity('New York')} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`weather-dashboard ${darkMode ? 'dark' : 'light'}`}>
      {/* Header */}
      <header className="dashboard-header">
        <h1>Weather Dashboard</h1>
        <div className="controls">
          <div className="search-container">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name"
              className="search-input"
            />
            <button onClick={fetchWeatherData} className="search-btn">
              Search
            </button>
          </div>
          <button onClick={toggleDarkMode} className="theme-toggle">
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      {weatherData && (
        <main className="dashboard-main">
          {/* Current Weather */}
          <section className="current-weather">
            <h2>Current Weather</h2>
            <div className="current-content">
              <div className="current-main">
                <img
                  src={getWeatherIcon(weatherData.weather[0].icon)}
                  alt={weatherData.weather[0].description}
                  className="weather-icon-large"
                />
                <div className="temperature-main">
                  <span className="temp">{Math.round(weatherData.main.temp)}°C</span>
                  <span className="description">{weatherData.weather[0].description}</span>
                </div>
              </div>
              <div className="current-details">
                <div className="detail-item">
                  <span className="label">Feels like</span>
                  <span className="value">{Math.round(weatherData.main.feels_like)}°C</span>
                </div>
                <div className="detail-item">
                  <span className="label">Humidity</span>
                  <span className="value">{weatherData.main.humidity}%</span>
                </div>
                <div className="detail-item">
                  <span className="label">Wind</span>
                  <span className="value">{weatherData.wind.speed} m/s</span>
                </div>
                <div className="detail-item">
                  <span className="label">Pressure</span>
                  <span className="value">{weatherData.main.pressure} hPa</span>
                </div>
              </div>
            </div>
          </section>

          {/* Hourly Forecast */}
          <section className="hourly-forecast">
            <h2>24-Hour Forecast</h2>
            <div className="hourly-list">
              {getHourlyForecast().map((hour, index) => (
                <div key={index} className="hourly-item">
                  <span className="time">{formatTime(hour.dt)}</span>
                  <img
                    src={getWeatherIcon(hour.weather[0].icon)}
                    alt={hour.weather[0].description}
                    className="weather-icon-small"
                  />
                  <span className="temp">{Math.round(hour.main.temp)}°</span>
                </div>
              ))}
            </div>
          </section>

          {/* Weekly Forecast */}
          <section className="weekly-forecast">
            <h2>7-Day Forecast</h2>
            <div className="weekly-list">
              {getDailyForecast().map((day, index) => (
                <div key={index} className="daily-item">
                  <span className="day">{formatDate(day.dt)}</span>
                  <img
                    src={getWeatherIcon(day.weather[0].icon)}
                    alt={day.weather[0].description}
                    className="weather-icon-small"
                  />
                  <div className="temp-range">
                    <span className="max-temp">{Math.round(day.main.temp_max)}°</span>
                    <span className="min-temp">{Math.round(day.main.temp_min)}°</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}
    </div>
  );
};

export default WeatherDashboard;