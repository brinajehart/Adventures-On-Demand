const express = require("express");
const app = express()
const path = require('path')
const views = __dirname

app.listen(process.env.PORT || 5000, () => console.log("App running"))
app.use('/public', express.static('public'))

//app routes
app.get('/', (req, res) => res.sendFile(path.join(views + '/index.html')));

