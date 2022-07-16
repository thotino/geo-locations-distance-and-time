const axios = require('axios')
const geolib = require('geolib')
const redis = require('redis')



const { Client } = require('@googlemaps/google-maps-services-js')

const mapsClient = new Client({ axiosInstance: axios })

const { googleMapsAPIKey: API_KEY, redisPort: REDIS_PORT } = require('../config')

const redisClient = redis.createClient(REDIS_PORT)
redisClient.on('error', (error) => { console.log(error) })

const getCountry = async ({ latitude, longitude }) => {
  try {
    const location = await mapsClient.reverseGeocode({
      params: {
        latlng: { lat: latitude, lng: longitude },
        key: API_KEY,
        result_type: 'country'
      }
    })
    const { data: { results } } = location
    if (!results || !results.length) throw new Error('ERR_NO_COUNTRY_RESULT_FOUND')
    return results.find(({ types }) => types.includes('country')).formatted_address
  } catch (error) {
    console.log({ method: 'GetCountry', error: error.message })
    return Promise.reject(error)
  }
}

const getTimezone = async ({ latitude, longitude }) => {
  try {
    const timezone = await mapsClient.timezone({
      params: {
        location: `${latitude},${longitude}`,
        timestamp: 0,
        key: API_KEY
      }
    })
    const { data: results } = timezone
    if (!results) throw new Error('ERR_NO_TIMEZONE_RESULT_FOUND')
    if (results.status !== 'OK') throw new Error(results.errorMessage)
    return results.rawOffset
  } catch (error) {
    console.log({ method: 'GetTimezone', error: error.message })
    return Promise.reject(error)
  }
}

const getDistanceWithGMaps = async ({ origin, destination, units = 'metric' }) => {
  try {
    const { latitude: originLatitude, longitude: originLongitude } = origin
    const { latitude: destinationLatitude, longitude: destinationLongitude } = destination
    const distanceMatrix = await mapsClient.distancematrix({
      params: {
        destinations: [`${destinationLatitude},${destinationLongitude}`],
        origins: [`${originLatitude},${originLongitude}`],
        units,
        key: API_KEY
      }
    })
    const { data: results } = distanceMatrix
    if (!results) throw new Error('ERR_NO_DISTANCE_RESULT_FOUND')
    if (results.status !== 'OK') throw new Error(results.error_message)
    return results
  } catch (error) {
    console.log({ method: 'GetDistanceWithGMaps', error: error.message })
    return Promise.reject(error)
  }
}

const getDistanceWithGeoLib = async ({ origin, destination }) => {
  try {
    const distanceInMeters = geolib.getDistance(origin, destination)
    const distanceInKms = geolib.convertDistance(distanceInMeters, 'km')
    return distanceInKms
  } catch (error) {
    console.log({ method: 'GetDistanceWithGeoLib', error: error.message })
    return Promise.reject(error)
  }
}

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
    await redisClient.connect()
    await redisClient.set(redisKey, JSON.stringify(results))
    await redisClient.disconnect()
  } catch (error) {
    console.log(`[SetRedisCachedData] ${error.message}`)
  }
}

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
