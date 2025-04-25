
const { createClient } = require('redis');
const { log } = console;

const redisUrl = process.env.REDIS_CONNECTION_STRING

const redis = createClient({
  url: redisUrl
});

redis.on('connect', () => {
  log(`Connected Redis Successfully`)
})
redis.on('error', (e) => {
  log(`Redis connection failed ${e}`)
})


module.exports = redis; 