const express = require("express");
const app = express();
const path = require('path');
const views = __dirname;
const axios = require("axios");

app.listen(process.env.PORT || 5000, () => console.log("App running"))
app.use('/public', express.static('public'))


function getGeoLocation(_geoLocation) {
    return new Promise(async resolve => {
        axios.get(`https://geocoder.ls.hereapi.com/6.2/geocode.json?apiKey=GgNHufnEFPzP3_ul16X0n-CA2T9G4qxw4ZD2eL-r3FU&searchtext=${_geoLocation}`)
            .then(response => {
                resolve(response.data.Response.View[0].Result[0].Location.DisplayPosition);
            })
            .catch(err => resolve(err))
    });
}

function getIntermediateLocations(start, end) { //vmesne lokacije
    return new Promise(async resolve => {
        axios.get(`https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=GgNHufnEFPzP3_ul16X0n-CA2T9G4qxw4ZD2eL-r3FU&waypoint0=geo!${start.Latitude},${start.Longitude}&waypoint1=geo!${end.Latitude},${end.Longitude}&mode=fastest;car;traffic:disabled`)
            .then(response => {
                resolve(response.data.response.route[0].leg[0].maneuver);
            })
            .catch(err => resolve(err))
    });
}

function getLocationWeather(_location) {
    return new Promise(async resolve => {
        axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${(_location.latitude)}&lon=${(_location.longitude)}&units=metric&appid=6a48ec8b6f383be39ad16e614661abe1`)
            .then(response => {
                resolve(response.data);
            })
            .catch(err => resolve(err))
    });
}

//app routes
app.get('/', (req, res) => res.sendFile(path.join(views + '/index.html')));
app.get('/api-get-location/:CurrentDest/:DesiredDest', async (req, res) => {
    let currentDest = req.params.CurrentDest;
    let desiredDest = req.params.DesiredDest;
    let _getGeoLocation = await getGeoLocation(currentDest);
    let _get2ndGeoLocation = await getGeoLocation(desiredDest);
    let locations = await getIntermediateLocations(_getGeoLocation, _get2ndGeoLocation);
    locations = locations.map(location => location.position);
    let subLength = Math.round(locations.length / 5);
    let legitResult = []; //empty array
    for (let i = 0; i < locations.length; i += subLength) {
        let temporary = locations.slice(i, i + subLength);
        temporary = await Promise.all(temporary.map(async item => await getLocationWeather(item)));
        temporary = temporary.sort((x, y) => x.main.temp > y.main.temp ? -1 : 1)[0];
        console.log(temporary);
        legitResult.push({
            temperatura: temporary.main.temp,
            ime: temporary.name,
            vreme: temporary.weather[0].main,
            zemljepisna_visina: temporary.coord.lat,
            zemljepisna_sirina: temporary.coord.lon
        });
    }
    res.status(200).json({
        legitResult
    })

});



