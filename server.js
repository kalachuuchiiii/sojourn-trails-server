require("dotenv").config();
const express = require('express');
const cors = require('cors'); 
const cookieParser = require('cookie-parser');
const { log, error } = console;
const { connectDb } = require('./lib/connectDb.js');
const redis = require('./redisCli/redis.js');
const { router } = require('./router/router.js');





const app = express(); 
app.use(cookieParser());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))
app.use(express.json({limit: '50mb'}));
app.use('/api', router);

const PORT = process.env.PORT;

connectDb().then(() => {
  redis.connect().then(() => {
  app.listen(PORT,() => {
  log(`Live server running on http://localhost:${PORT}`);
})
})
})

module.exports = app


