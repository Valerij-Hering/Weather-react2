const WeatherInfo = ({ weatherData, data }) => {

    // Функция для капитализации первых букв каждого слова
    function capitalizeWords(text) {
        return text.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // Функция для форматирования текущей даты
    function formatDate() {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return today.toLocaleDateString('en-US', options);
    }

    const description = weatherData.weather[0].description;
    const capitalizedDescription = capitalizeWords(description);

    return (
        <div className="weather-info" >
            <p className="weather-info-city">{weatherData.name}, {weatherData.sys.country}</p>
            <p className="weather-info-discr">{capitalizedDescription}</p>
            <p className="weather-info-temp">{Math.round(weatherData.main.temp)}°</p>
            <p className="weather-info-discr">Min: {(weatherData.main.temp_min).toFixed()}° - Max: {(weatherData.main.temp_max).toFixed()}°</p>
            <p className="weather-info-discr">{formatDate()}</p>
        </div>
    );
};

export default WeatherInfo;
