const apiKey = "4b83b68d896dbfe6b76026157a5c61bd"; //  OpenWeatherMap API key to fetch weather data
document.querySelector(".search-btn").addEventListener("click", () => {
  const city = document.querySelector(".city-input").value.trim();
  if (city) {
    fetchWeatherData(city);
  } else {
    alert("Please enter a city name.");
  }
});

document.querySelector(".location-btn").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      fetchWeatherData(null, latitude, longitude);
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

function fetchWeatherData(city, lat, lon) {
  let url;
  if (city) {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  } else if (lat && lon) {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  } else {
    console.error("No city or location provided.");
    return;
  }

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      updateCurrentWeatherUI(data);
      fetchForecastData(data.coord.lat, data.coord.lon);
      updateRecentSearches(data.name);
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
      alert("Failed to fetch weather data. Please try again.");
    });
}

function fetchForecastData(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      updateForecastUI(data);
      updateHourlyUI(data);
    })
    .catch((error) => {
      console.error("Error fetching forecast data:", error);
    });
}

function updateCurrentWeatherUI(data) {
    const weatherElement = document.querySelector('.current-weather h2');
    const tempElement = document.querySelector('.current-weather p:nth-of-type(1)');
    const windElement = document.querySelector('.current-weather p:nth-of-type(2)');
    const humidityElement = document.querySelector('.current-weather p:nth-of-type(3)');
    const pressureElement = document.querySelector('.current-weather p:nth-of-type(4)');
    const iconElement = document.querySelector('.weather-icon');

    weatherElement.textContent = `${data.name} (${data.weather[0].description})`;
    tempElement.textContent = `Temperature: ${data.main.temp}°C`;
    windElement.textContent = `Wind Speed: ${data.wind.speed} M/S`;
    humidityElement.textContent = `Humidity: ${data.main.humidity}%`;
    pressureElement.textContent = `Pressure: ${data.main.pressure} hPa`;
    iconElement.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
}

function updateForecastUI(data) {
    const forecastCards = document.querySelectorAll('.days-forecast .card');

    forecastCards.forEach(card => {
        card.querySelector('h3').textContent = '( ______ )';
        card.querySelectorAll('p').forEach(p => p.textContent = '______');
        card.querySelector('.forecast-icon').src = ''; 
    });

    for (let i = 0; i < forecastCards.length; i++) {
        const forecast = data.list[i * 8]; 
        const card = forecastCards[i];

        card.querySelector('h3').textContent = new Date(forecast.dt * 1000).toLocaleDateString();
        card.querySelector('p:nth-of-type(1)').textContent = `Temp: ${forecast.main.temp}°C`;
        card.querySelector('p:nth-of-type(2)').textContent = `Wind: ${forecast.wind.speed} M/S`;
        card.querySelector('p:nth-of-type(3)').textContent = `Humidity: ${forecast.main.humidity}%`;
        card.querySelector('.forecast-icon').src = `http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
    }
}
function updateHourlyUI(data) {
    const hourlyCardsContainer = document.querySelector('.hourly-forecast ul');
    hourlyCardsContainer.innerHTML = ''; 

    for (let i = 0; i < 5; i++) { 
        const hourlyData = data.list[i]; 
        const hour = new Date(hourlyData.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const card = document.createElement('li');
        card.className = 'hourly-card bg-gray-600 text-white rounded-lg shadow-lg p-4 text-center';
        card.innerHTML = `
            <h3 class="text-lg font-semibold">${hour}</h3>
            <p>Temp: ${hourlyData.main.temp}°C</p>
            <p>Wind: ${hourlyData.wind.speed} M/S</p>
            <p>Humidity: ${hourlyData.main.humidity}%</p>
        `;

        hourlyCardsContainer.appendChild(card);
    }
}

function updateRecentSearches(city) {
    const recentCitiesSelect = document.querySelector('.recent-cities');
    const currentOptions = Array.from(recentCitiesSelect.options).map(option => option.value);

    if (!currentOptions.includes(city)) {
        const newOption = document.createElement('option');
        newOption.value = city;
        newOption.textContent = city;
        recentCitiesSelect.appendChild(newOption);
        const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
        recentCities.push(city);
        localStorage.setItem('recentCities', JSON.stringify([...new Set(recentCities)]));
    }
}

window.addEventListener('load', () => {
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    const recentCitiesSelect = document.querySelector('.recent-cities');

    recentCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        recentCitiesSelect.appendChild(option);
    });

    recentCitiesSelect.addEventListener('change', (event) => {
        const selectedCity = event.target.value;
        if (selectedCity) {
            fetchWeatherData(selectedCity);  
        }
    });
});
