const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();

//middleWare
app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
    res.send('The Server has started')
})

app.listen(port, () => {
    console.log(`The server is running on port: ${port}`)
})