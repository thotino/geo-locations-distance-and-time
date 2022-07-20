const axios = require('axios')
const geolib = require('geolib')

const { Client } = require('@googlemaps/google-maps-services-js')

const mapsClient = new Client({ axiosInstance: axios })

const { googleMapsAPIKey: API_KEY } = require('../config')

/**
 * Use the Reverse Geocode module to get the country
 * @returns
 */
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

/**
   * Use the Timezone module to get the timezone raw offset
   * @returns
   */
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

/**
   * Use the distance matrix module to compute the distance between an origin and a destination
   * @returns
   */
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

/**
   * Use the geolib module to compute the distance between two geo locations
   * @returns
   */
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

module.exports = { getCountry, getDistanceWithGMaps, getDistanceWithGeoLib, getTimezone }
