const nconf = require('nconf')
nconf.argv().env().file({ file: 'nconf.json' })

module.exports = {
  environment: nconf.get('NODE_ENV'),
  googleMapsAPIKey: nconf.get('APP_GOOGLE_MAPS_API_KEY') || 'AIzaSyBrRh0NjtrSopoOrG-4_W3OP0nmzSDQK-M',
  port: nconf.get('APP_SERVER_PORT') || 3000,
  redisPort: nconf.get('APP_REDIS_PORT') || 6379,
  redisUrl : nconf.get('APP_REDIS_URL') || 'redis://127.0.0.1:6379'
  // 'redis://VQAsdX0miU@redis-master.default.svc.cluster.local:6379'
}
