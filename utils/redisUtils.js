const redis = require('redis')
const { redisPort: REDIS_PORT } = require('../config')

const redisClient = redis.createClient(REDIS_PORT)
redisClient.on('error', (error) => { console.log(error) })

const getCachedData = async ({ key }) => {
  await redisClient.connect()
  const cachedData = await redisClient.get(key)
  await redisClient.disconnect()
  return cachedData
}

const setCachedData = async ({ key, data }) => {
  await redisClient.connect()
  await redisClient.set(key, JSON.stringify(data))
  await redisClient.disconnect()
  return true
}

module.exports = { getCachedData, setCachedData }
