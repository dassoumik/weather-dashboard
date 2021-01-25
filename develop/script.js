$(document).ready(function () {
    var apikey = "d148acf561309eb9900a78ae19d271bb";
    var cityHistory = ["atlanta"];
    $(".list-group-flush").empty();
    var searchCityEntered = false;
    cityHistory = JSON.parse(localStorage.getItem("cityHistLS"));
    if (cityHistory == null) {
        cityHistory = ["atlanta"];
    }
    var lastCity = cityHistory[0];
    $(".search-field").val(lastCity);

    function startSearch(e) {
        e.preventDefault();
        if (searchCityEntered) {
            cityName = $(".search-field").val().trim();
            cityHistory.forEach((item, index) => {
                if (item == cityName) {
                    cityHistory.splice(index, 1);
                    return false;
                }
            })
            cityHistory.reverse();
            cityHistory.push(cityName);
            cityHistory.reverse();
            searchCityEntered = false;
        } else {
            cityName = cityHistory[0];
        }

        $(".list-group-flush").empty();

        for (let i = 0; i < 4; i++) {
            if (i > cityHistory.length) {
                break;
            }
            var newItem = $("<li>").addClass("list-group-item text-capitalize").text(cityHistory[i]);
            newItem.appendTo(".list-group");
        }
        localStorage.setItem("cityHistLS", JSON.stringify(cityHistory));
        var URLname = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + ",US&units=imperial&appid=" + apikey;
        $.ajax({
            url: URLname,
            method: "GET"
        }).then(function (res) {
            $(".city-name").text(res.name);
            $(".temp-data").text(res.main.temp);
            $(".humid-data").text(res.main.humidity);
            $(".wind-data").text(res.wind.speed);
            var imgsrc = "http://openweathermap.org/img/wn/" + res.weather[0].icon + ".png";
            $(".weather-icon").attr("src", imgsrc);
            $(".weather-icon").attr("class", "visible");
            setUVindex(res.coord.lon, res.coord.lat);
        })
    }

    function setUVindex(lon, lat) {
        $.ajax({
            url: "http://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&exclude=hourly,minutely,alert&appid=" + apikey,
            method: "GET"
        }).done(function (res) {
            DateTime = luxon.DateTime;
            date = new DateTime.fromSeconds(res.current.dt).toLocal();
            dateLocal = DateTime.fromObject(date.c).toFormat("f").split(",")[0];
            var nameDate = $(".city-name").text() + "(" + dateLocal + ")";
            $(".uv-data").text(res.current.uvi);
            if (res.current.uvi > 6) {
                $(".uv-data").attr("class", "bg-danger text-white p-2");
            }
            $(".city-name").text(nameDate);
            var cardHeader = $(".card-header");
            var cardTemp = $(".card-temp");
            var cardHumid = $(".card-humid");
            var cardImage = $(".card-img");
            for (let i = 1; i < 6; i++) {
                var cardDate = $(cardHeader[i - 1])
                date = DateTime.fromSeconds(res.daily[i].dt).toLocal();
                dateLocal = DateTime.fromObject(date.c).toFormat("f").split(",")[0];
                cardDate.text(dateLocal);
                $(cardTemp[i - 1]).text(Math.floor(res.daily[i].temp.day));
                $(cardHumid[i - 1]).text(Math.floor(res.daily[i].humidity));
                cardIcon = res.daily[i].weather[0].icon;
                $(cardImage).attr("src", "http://openweathermap.org/img/wn/" + res.daily[i].weather[0].icon + ".png");
            }
        })
        return;
    }

    $(window).on("load", startSearch);
    $(".search-submit").on("click", startSearch);

    $(".search-field").on("change", function () {
        searchCityEntered = true;
    });
});