function attachEvents() {
    const baseUrl = 'http://localhost:3030/jsonstore/forecaster';

    const symbols = {
        'Sunny': '&#x2600;',
        'Partly sunny': ' &#x26C5;',
        'Overcast': '&#x2601;',
        'Rain': '&#x2614;',
        'Degrees': '&#176;'
    };

    const locationInputEl = document.getElementById('location');
    const submitInputEl = document.getElementById('submit');

    const forecastDivEl = document.getElementById('forecast');
    const currentDivEl = document.getElementById('current');
    const upcomingDivEl = document.getElementById('upcoming');

    submitInputEl.addEventListener('click', handleDisplayForecast);

    async function handleDisplayForecast() {
        const chosenLocationName = locationInputEl.value;

        const locationsResponse = await fetch(`${baseUrl}/locations`);
        const locationsData = await locationsResponse.json();

        const chosenLocationObj = locationsData.find(location => location.name === chosenLocationName);
        const chosenLocationCode = chosenLocationObj.code;

        const todayForecastResponse = await fetch(`${baseUrl}/today/${chosenLocationCode}`);
        const todayForecastData = await todayForecastResponse.json();
        // {
        //     forecast: { condition: 'Sunny', high: '19', low: '8' },
        //     name: 'New York, USA'
        // }

        const forecastsDivEl = document.createElement('div');
        forecastsDivEl.className = 'forecasts';

        const symbolSpanEl = document.createElement('span');
        symbolSpanEl.className = 'condition symbol';

        const condition = todayForecastData.forecast.condition;
        symbolSpanEl.innerHTML = symbols[condition];

        const conditionWrapperSpanEl = document.createElement('span');
        conditionWrapperSpanEl.className = 'condition';

        const locationSpanEl = document.createElement('span');
        locationSpanEl.className = 'forecast-data';
        locationSpanEl.textContent = todayForecastData.name;

        const degreesSpanEl = document.createElement('span');
        degreesSpanEl.className = 'forecast-data';
        degreesSpanEl.innerHTML = `${todayForecastData.forecast.low}${symbols.Degrees}/${todayForecastData.forecast.high}${symbols.Degrees}`;

        const conditionSpanEl = document.createElement('span');
        conditionSpanEl.className = 'forecast-data';
        conditionSpanEl.textContent = todayForecastData.forecast.condition;

        conditionWrapperSpanEl.appendChild(locationSpanEl);
        conditionWrapperSpanEl.appendChild(degreesSpanEl);
        conditionWrapperSpanEl.appendChild(conditionSpanEl);

        forecastsDivEl.appendChild(symbolSpanEl);
        forecastsDivEl.appendChild(conditionWrapperSpanEl);

        currentDivEl.appendChild(forecastsDivEl);

        const threeDayForecastResponse = await fetch(`${baseUrl}/upcoming/${chosenLocationCode}`);
        const threeDayForecastData = await threeDayForecastResponse.json();

        // {
        //     name: 'New York',
        //     forecast: [
        //         {condition: 'Partly sunny', high: '17', low: '6'},
        //         {condition: 'Overcast', high: '9', low: '3'},
        //         {condition: 'Overcast', high: '9', low: '3'}
        //     ]
        // }

        const threeDayForecasts = threeDayForecastData.forecast;

        const forecastInfoDivEl = document.createElement('div');
        forecastInfoDivEl.className = 'forecast-info';

        for (const forecast of threeDayForecasts) {
            //    forecast = {
            //      condition: 'Partly sunny', 
            //      high: '17', 
            //      low: '6'
            //    },

            const upcomingSpanEl = document.createElement('span');
            upcomingSpanEl.className = 'upcoming';

            const upcomingSymbolSpanEl = document.createElement('span');
            upcomingSymbolSpanEl.className = 'symbol';

            const upcomingSymbol = symbols[forecast.condition];
            upcomingSymbolSpanEl.innerHTML = upcomingSymbol;

            const upcomingDegreesSpanEl = document.createElement('span');
            upcomingDegreesSpanEl.className = 'forecast-data';
            upcomingDegreesSpanEl.innerHTML = `${forecast.low}${symbols.Degrees}/${forecast.high}${symbols.Degrees}`;

            const upcomingConditionSpanEl = document.createElement('span');
            upcomingConditionSpanEl.className = 'forecast-data';
            upcomingConditionSpanEl.textContent = forecast.condition;

            upcomingSpanEl.appendChild(upcomingSymbolSpanEl);
            upcomingSpanEl.appendChild(upcomingDegreesSpanEl);
            upcomingSpanEl.appendChild(upcomingConditionSpanEl);

            forecastInfoDivEl.appendChild(upcomingSpanEl);
        }

        upcomingDivEl.appendChild(forecastInfoDivEl);

        forecastDivEl.style.display = 'block';
    }
}

attachEvents();