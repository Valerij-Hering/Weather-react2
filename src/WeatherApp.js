import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import CityInput from './components/CityInput';
import WeatherInfo from './components/WeatherInfo';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import PressureScale from './components/PressureScale';
import WindScale from './components/WindScale';
import UvIndex from './components/UvIndex';
import Visibility from './components/Visibility';
import DewPoint from './components/DewPoint';

const WeatherApp = () => {
    const api = {
        endpoint: 'https://api.openweathermap.org/data/2.5/',
        key: '6b9f15577ef5c811ae35044127a9dda3'
    };

    const [weatherData, setWeatherData] = useState(null);
    const [hourlyWeather, setHourlyWeather] = useState([]);
    const [dailyWeather, setDailyWeather] = useState([]);
    const [city, setCity] = useState('');
    const [isCitySearch, setIsCitySearch] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [pressure, setPressure] = useState(0);
    const [wind, setWind] = useState({ speed: 0, gust: 0, deg: 0 });
    const [uvIndex, setUvIndex] = useState(0);
    const [theme, setTheme] = useState('light');
    const [data, setData] = useState([]);

    // Сохраняем и загружаем тему
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.body.className = savedTheme === 'light' ? '' : 'dark-theme';
    }, []);

    // Получаем погоду по геолокации
    const getWeatherByLocation = useCallback(async (position) => {
        setIsLoading(true);
        const { latitude, longitude } = position.coords;
        try {
            const res = await fetch(`${api.endpoint}weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${api.key}`);
            const result = await res.json();
            setWeatherData(result);
            setPressure(result.main.pressure);
            setWind(result.wind);
            
            const resHourly = await fetch(`${api.endpoint}onecall?lat=${result.coord.lat}&lon=${result.coord.lon}&exclude=&units=metric&appid=${api.key}`);
            const resultHourly = await resHourly.json();
            setHourlyWeather(resultHourly.hourly);
            setDailyWeather(resultHourly.daily);
            setUvIndex(resultHourly.daily[0].uvi);
            setIsLoading(false);
            setData(resultHourly);
        } catch (error) {
            console.error('Error fetching weather data by location:', error);
            setIsLoading(false);
        }
    }, [api.key, api.endpoint]);

    // Получаем погоду по названию города
    const getWeatherByCity = async () => {
        if (city) {
            setIsLoading(true);
            try {
                const res = await fetch(`${api.endpoint}weather?q=${city}&units=metric&appid=${api.key}`);
                const result = await res.json();
                setWeatherData(result);
                setIsCitySearch(true);
                setPressure(result.main.pressure);
                setWind(result.wind);
    
                const resHourly = await fetch(`${api.endpoint}onecall?lat=${result.coord.lat}&lon=${result.coord.lon}&exclude=current,minutely,alerts&units=metric&appid=${api.key}`);
                const resultHourly = await resHourly.json();
                setHourlyWeather(resultHourly.hourly);
                setDailyWeather(resultHourly.daily);
                setUvIndex(resultHourly.daily[0].uvi);

    
                setCity('');
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching weather data by city:', error);
                setIsLoading(false);
            }
        }
    };

    // Получаем погоду по геолокации с обработкой отказа пользователя
    useEffect(() => {
        if (!isCitySearch && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                getWeatherByLocation,
                (error) => {
                    console.log("Геолокация недоступна: ", error);
                    // Устанавливаем нулевые значения погоды
                    setWeatherData({
                        name: 'Unknown',
                        main: {
                            temp: 0,
                            feels_like: 0,
                            humidity: 0,
                            pressure: 0,
                        },
                        wind: {
                            speed: 0,
                            deg: 0,
                        },
                        weather: [{ description: 'No data', icon: '01d' }],
                        sys: { country: '' },
                    });
                    setIsLoading(false);
                }
            );
        }
    }, [isCitySearch, getWeatherByLocation]);

    const getWeatherByKeyPress = async (e) => {
        if (e.key === 'Enter') {
            await getWeatherByCity();
        }
    };

    const handleCitySearchClick = async () => {
        await getWeatherByCity();
    };

    return (
        <div>
            {isLoading ? (
                <div className='spinner-container'>
                    <div className="spinner"></div> 
                </div> // Прелоадер во время загрузки
            ) : (
            <div className="weather-app" style={{backgroundImage: `url(weather-icons-header/${weatherData.weather[0].icon}.jpg)`}}>
                <div className='weather-container'>
                    <br/>
                    <br/>
                        {weatherData && (
                            <WeatherInfo 
                                data={data}
                                weatherData={weatherData} 
                                theme={theme} 
                                setTheme={setTheme} 
                            />
                        )}
                        <div className='box-input-btn'>
                            <CityInput 
                                city={city} 
                                setCity={setCity} 
                                handleCitySearchClick={handleCitySearchClick} 
                                getWeatherByKeyPress={getWeatherByKeyPress} 
                            />
                        </div>

                        <div className='box-TemperatureChart_HourlyForecast'>
                            {/* <div className="container-hourly_weather_chart">
                                <p>{menu === 'chart' ? 'Weather Change Chart' : 'World Map'}</p>
                                    <WeatherComponent weatherData={weatherData} apiKey={api.key} />
                            </div> */}
                            {hourlyWeather.length > 0 && (
                                <HourlyForecast data={data} hourlyWeather={hourlyWeather} timezone={weatherData?.timezone} />
                            )}
                        </div>

                        {dailyWeather.length > 0 && (
                            <DailyForecast
                                dailyWeather={dailyWeather}
                            />
                        )}

                    {weatherData && (
                        <div className='section-wind_pressure'>
                            <WindScale wind={wind}/>
                            <PressureScale pressure={pressure}/>
                            <UvIndex uvIndex={uvIndex}/>
                            <Visibility data={data}/>
                            <DewPoint/>
                        </div>
                    )}
                </div>
            </div>
            )}
        
        </div>
    );
};

export default WeatherApp;
