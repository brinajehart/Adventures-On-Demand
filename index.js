const express = require("express");
const app = express();
const path = require('path');
const views = __dirname;
const axios = require("axios");

app.listen(process.env.PORT || 5000, () => console.log("App running"))
app.use('/public', express.static('public'))

//app routes
app.get('/', (req, res) => res.sendFile(path.join(views + '/index.html')));
app.get('/api-get-location/:CurrentDest/:DesiredDest', (req, res) => {
    axios.get(`https://best-way.herokuapp.com/api/between/${req.params.CurrentDest}/${req.params.DesiredDest}`).then(response => { 
        console.log(response.data)
        res.status(200).json({result: response.data}) 
    }).catch(console.log)
});
