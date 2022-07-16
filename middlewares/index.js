const Joi = require('joi')
const redis = require('redis')

const { redisPort: REDIS_PORT } = require('../config')

const redisClient = redis.createClient(REDIS_PORT)
redisClient.on('error', (error) => { console.log(error) })

const schema = Joi.object({
  start: Joi.object({
    lat: Joi.number().required().min(-90).max(90),
    lng: Joi.number().required().min(-180).max(180)
  }).required(),
  end: Joi.object({
    lat: Joi.number().required().min(-90).max(90),
    lng: Joi.number().required().min(-180).max(180)
  }).required(),
  units: Joi.string().optional().allow('metric', 'imperial')
})

const verifyRequest = (req, res, next) => {
  try {
    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({ error })
    }
    next()
  } catch (error) {
    return Promise.reject(error)
  }
}

const getRedisCachedData = async (req, res, next) => {
  try {
    const { start: { lat: startLat, lng: startLon }, end: { lat: endLat, lng: endLon }, units } = req.body
    const redisKey = `locations::start=${startLat},${startLon}::end=${endLat},${endLon}::unit=${units}`

    await redisClient.connect()
    const cachedData = await redisClient.get(redisKey)
    await redisClient.disconnect()

    if (cachedData) {
      return res.json(JSON.parse(cachedData))
    } else { next() }
  } catch (error) {
    console.log(`[GetRedisCachedData] ${error.message}`)
    next()
  }
}

module.exports = { verifyRequest, getRedisCachedData }
