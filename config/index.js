const nconf = require('nconf')
nconf.argv().env().file({ file: 'nconf.json' })

module.exports = {
    environment: nconf.get('NODE_ENV'),
    googleMapsAPIKey: nconf.get('APP_GOOGLE_MAPS_API_KEY') || 'AIzaSyBrRh0NjtrSopoOrG-4_W3OP0nmzSDQK-M'
}