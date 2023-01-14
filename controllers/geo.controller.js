const { getCountry, getTimezone, getDistanceWithGMaps, getDistanceWithGeoLib } = require('../utils/geoUtils')

const { RedisClient } = require('../utils/redis')
const redisClient = new RedisClient()

/**
 * Return a formatted object from the locations and the computed distance
 * @returns
 */
const formatDistanceAndTimeResults = ({ startLocation, endLocation, distance }) => {
  try {
    const { country: startCountry, timezone: startTimezone, latitude: startLatitude, longitude: startLongitude } = startLocation
    const { country: endCountry, timezone: endTimezone, latitude: endLatitude, longitude: endLongitude } = endLocation

    return {
      start: {
        country: startCountry,
        timezone: Math.sign(startTimezone) === 1 ? `GMT+${startTimezone / 3600}` : `GMT${startTimezone / 3600}`,
        location: { lat: startLatitude, lng: startLongitude }
      },
      end: {
        country: endCountry,
        timezone: Math.sign(endTimezone) === 1 ? `GMT+${endTimezone / 3600}` : `GMT${endTimezone / 3600}`,
        location: { lat: endLatitude, lng: endLongitude }
      },
      distance: {
        value: distance,
        units: 'km'
      },
      time_diff: {
        value: (endTimezone - startTimezone) / 3600,
        units: 'hours'
      }
    }
  } catch (error) {
    console.log({ method: 'FormatDistanceAndTimeResults', error: error.message })
    return Promise.reject(error)
  }
}

const setRedisCachedData = async ({ reqBody, results }) => {
  try {
    const { start: { lat: startLat, lng: startLon }, end: { lat: endLat, lng: endLon }, units } = reqBody
    const redisKey = `locations::start=${startLat},${startLon}::end=${endLat},${endLon}::unit=${units}`
    await redisClient.set(redisKey, results)
  } catch (error) {
    console.log(`[SetRedisCachedData] ${error.message}`)
  }
}

/**
 * the handler
 * @param {*} req - the request object
 * @param {*} res - the response object
 * @param {*} next - the next function
 * @returns
 */
const getDistanceAndTime = async (req, res, next) => {
  try {
    const { start: { lat: startLat, lng: startLon }, end: { lat: endLat, lng: endLon }, units } = req.body
    const startCountry = await getCountry({ latitude: startLat, longitude: startLon })
    const startTimezone = await getTimezone({ latitude: startLat, longitude: startLon })

    const endCountry = await getCountry({ latitude: endLat, longitude: endLon })
    const endTimezone = await getTimezone({ latitude: endLat, longitude: endLon })
    let distance = null
    try {
      distance = await getDistanceWithGMaps({
        origin: { latitude: startLat, longitude: startLon },
        destination: { latitude: endLat, longitude: endLon },
        units
      })
    } catch (error) {
      distance = await getDistanceWithGeoLib({
        origin: { latitude: startLat, longitude: startLon },
        destination: { latitude: endLat, longitude: endLon }
      })
    }

    const formattedResults = formatDistanceAndTimeResults({
      startLocation: { country: startCountry, timezone: startTimezone, latitude: startLat, longitude: startLon },
      endLocation: { country: endCountry, timezone: endTimezone, latitude: endLat, longitude: endLon },
      distance
    })
    await setRedisCachedData({ reqBody: req.body, results: formattedResults })
    return res.status(200).json(formattedResults)
  } catch (error) {
    console.log({ method: 'GetDistanceAndTime', error: error.message })
    return res.status(500).json({ error: error.message })
  }
}

module.exports = { getDistanceAndTime }
