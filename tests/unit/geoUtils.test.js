const { getCountry, getTimezone, getDistanceWithGMaps, getDistanceWithGeoLib } = require('../../utils/geoUtils')
const ClientMock = require('@googlemaps/google-maps-services-js').Client

// const setupGoogleMock = () => {
//   /** * Mock Google Maps JavaScript API ***/
//   const google = {
//     maps: {
//       places: {
//         AutocompleteService: () => {},
//         PlacesServiceStatus: {
//           INVALID_REQUEST: 'INVALID_REQUEST',
//           NOT_FOUND: 'NOT_FOUND',
//           OK: 'OK',
//           OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
//           REQUEST_DENIED: 'REQUEST_DENIED',
//           UNKNOWN_ERROR: 'UNKNOWN_ERROR',
//           ZERO_RESULTS: 'ZERO_RESULTS'
//         }
//       },
//       reverseGeocode: () => {},
//       Geocoder: () => {},
//       GeocoderStatus: {
//         ERROR: 'ERROR',
//         INVALID_REQUEST: 'INVALID_REQUEST',
//         OK: 'OK',
//         OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
//         REQUEST_DENIED: 'REQUEST_DENIED',
//         UNKNOWN_ERROR: 'UNKNOWN_ERROR',
//         ZERO_RESULTS: 'ZERO_RESULTS'
//       }
//     }
//   }
//   // global.window.google = google
// }

describe('[unit] helpers `GeoUtils`', () => {
  describe('[unit] function `getCountry`', () => {

    test('should fail if no coordinate is provided', async () => {
      await expect(getCountry({ latitude: null, longitude: null })).rejects.toThrow('ERR_NO_VALID_PARAMETER_PROVIDED')
      await expect(getCountry({ latitude: 0, longitude: null })).rejects.toThrow('ERR_NO_VALID_PARAMETER_PROVIDED')
    })

    test.only('should fail if GMaps API fails', async () => {
      console.log({ ClientMock })
      ClientMock.mockImplementation(() => ({
        reverseGeocode: () => { throw new Error('ERR_RANDOM_ERROR_FROM_MODULE') }
      }))
      await expect(getCountry({ latitude: 0.01, longitude: 0.01 })).rejects
      await (ClientMock.reverseGeocode).toHaveBeenCalledTimes(1)
    })
  })
})
