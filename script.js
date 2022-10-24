const ApiKey = `74daefb956f8b3dbea0d7f059ab98e7a`;
const storeCity = [];
const temp = document.getElementById("temp");
const humidity = document.getElementById("humi");
const windSpeed = document.getElementById("wind");
const currdate = document.getElementById("date");
const icon = document.getElementById("icon");
const cardBx = document.getElementById("cardBx");
const cityName = document.getElementById("name");
const searchHistory = document.getElementById("history");

//format date
const formatDate = (getdate) => {
	const date = new Date(getdate * 1000);
	const day = date.getDate();
	const month = date.getMonth() + 1;
	const year = date.getFullYear();
	const formattedTime = month + "/" + day + "/" + year;
	return formattedTime;
};

// SHOW WEAHTER DETAILS
const showDetail = () => {
	//get data from localstorage
	const data = JSON.parse(localStorage.getItem("data"));
	const getName = localStorage?.getItem("name");

	if (data) {
		let renderCard = "";
		cityName.innerHTML = getName;
		data.daily.slice(1, 6).map((item) => {
			renderCard +=
				`<div class="card">
					<h1>${formatDate(item.dt)}</h1>
    				<img src="http://openweathermap.org/img/w/${item.weather[0].icon}.png" alt=".." />
    				<p>Temp: ${item.temp.day} °F</p> 
    				<p>Wind: ${item.wind_speed} MPH</p>
    				<p>Humidity: ${item.humidity} %</p>
				</div>`;
		});

		cardBx.innerHTML = renderCard;
		currdate.innerHTML = `(${formatDate(data.current?.dt)})`;
		temp.innerHTML = `Temprature: ${data.current?.temp} °F`;
		humidity.innerHTML = `Humidity: ${data.current?.humidity} %`;
		windSpeed.innerHTML = `Wind speed: ${data.current?.wind_speed} MPH`;
		icon.setAttribute(
			"src",
			`http://openweathermap.org/img/w/${data.current?.weather?.[0].icon}.png`
		);
	}
};

// HNADLE CITY HISTORY
const handleCityHistory = (id) => {
	const history = JSON.parse(localStorage.getItem("history")).reverse();
	const histData = history.filter((item, ind) => {
		return history[ind] == history[id];
	});
	fetchCurrentWeatherApi(histData[0]);
};

// DISPLAY SERACHED CITY HITORY
const renderCityList = () => {
	let cityList = "";
	const history = JSON.parse(localStorage.getItem("history"));
	if (history) {
		const revhistory = history.reverse();
		revhistory.map((city, i) => {
			cityList += `<p onclick="handleCityHistory(${i})">${city}</p>`;
		});
		searchHistory.innerHTML = cityList;
	}
};

//FETCH-ONE-CALL-API
const fetchOneCallApi = async (lat, lon) => {
	try {
		const res = await fetch(
			`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&units=Imperial&appid=${ApiKey}`
		);
		const data = await res.json();
		localStorage.setItem("data", JSON.stringify(data));
	} catch (err) {
		console.log(err);
	} finally {
		showDetail();
		renderCityList();
	}
};

//FETCH-CURRENT-WEATHER-API
const fetchCurrentWeatherApi = async (city) => {
	const res = await fetch(
		`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=Imperial&appid=${ApiKey}`
	);
	const data = await res.json();
	if (data?.cod == 404) {
		window.alert("City not found! Try again.");
		return false;

	} else {
		const searchHistory = JSON.parse(localStorage.getItem("history"));
		if (searchHistory) {
			const nearrr = [...searchHistory, city]

			//REMOVING DUPLICATE CITY NAME
			const uniqueHistory = [...new Set(nearrr)];
			localStorage.setItem("history", JSON.stringify(uniqueHistory));
		} else {
			localStorage.setItem("history", JSON.stringify([city]));
		}
	}

	localStorage.setItem("name", data.name);
	fetchOneCallApi(data.coord.lat, data.coord.lon);
};

//HANDLE-SEARCH
const handleSearch = () => {
	const search = document.getElementById("city").value;
	if (!search) {
		window.alert("Please enter city name!");
		return false;
	}
	fetchCurrentWeatherApi(search);
	document.getElementById("city").value = "";
};

showDetail();
renderCityList();
