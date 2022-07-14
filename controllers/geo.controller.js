const axios = require('axios')
const { Client } = require('@googlemaps/google-maps-services-js')

const mapsClient = new Client({ axiosInstance: axios })
const API_KEY = 'AIzaSyBrRh0NjtrSopoOrG-4_W3OP0nmzSDQK-M'
const getCountry = async ({ latitude, longitude }) => {
    try {
        const startLocation = await mapsClient.reverseGeocode({ params: { 
            latlng: { lat: latitude, lng: longitude }, 
            key: API_KEY,
            result_type: 'country'
        } })
        const { data: { results } } = startLocation
        if (!results || !results.length) throw new Error('ERR_NO_COUNTRY_RESULT_FOUND')
        return results.find(({ types }) => types.includes('country')).formatted_address
    } catch (error) {
        console.log({ method: "GetCountry", error: error.message })
        return Promise.reject(error)
    }
}

const getTimezone = async ({ latitude, longitude }) => {
    try {        
        const startTimezone = await mapsClient.timezone({ params: { 
            location: `${latitude},${longitude}`, 
            timestamp: 0,
            key: API_KEY
        } })
        const { data: results } = startTimezone
        if (!results) throw new Error('ERR_NO_TIMEZONE_RESULT_FOUND')
        if (results.status !== 'OK') throw new Error(results.errorMessage)
        return results.rawOffset
    } catch (error) {
        console.log({ method: "GetTimezone", error: error.message })
        return Promise.reject(error)
    }
}

const getDistance = async ({ origin, destination, units = 'metric' }) => {
    try {
        const { latitude: originLatitude, longitude: originLongitude } = origin
        const { latitude: destinationLatitude, longitude: destinationLongitude } = destination
        const distanceMatrix = await mapsClient.distancematrix({ 
            params: {
                destinations: [`${destinationLatitude},${destinationLongitude}`],
                origins: [`${originLatitude},${originLongitude}`],
                units,
                key: 'AIzaSyD6X-NrF2hWPv8xMHJNjEpFNIb2WTLSXxU'
            }
        })
        const { data: results } = distanceMatrix
        if (!results) throw new Error('ERR_NO_DISTANCE_RESULT_FOUND')
        // if (results.status !== 'OK') throw new Error('ERR_')
        return results
    } catch (error) {
        console.log({ method: "GetDistance", error: error.message })
        return Promise.reject(error)
    }
}

const getDistanceAndTime = async (req, res) => {
    try {
        const { start: { lat: startLat, lng: startLon }, end: { lat: endLat, lng: endLong }, units } = req.body
        // const country = await getCountry({ latitude: startLat, longitude: startLon })
        // const timezone = await getTimezone({ latitude: startLat, longitude: startLon })
        const distanceMatrix = await getDistance({ 
            origin: { latitude: startLat, longitude: startLon },
            destination: { latitude: endLat, longitude: endLong },
            units
         })
        return res.json({ distanceMatrix })
    } catch (error) {
        return res.status(500).send(error)
    }
}

module.exports = { getDistanceAndTime }