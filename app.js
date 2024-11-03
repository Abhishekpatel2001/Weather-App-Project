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
