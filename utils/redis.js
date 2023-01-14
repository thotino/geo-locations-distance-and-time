const EventEmitter = require('node:events')
const redis = require('redis')

const { redisUrl: REDIS_URL } = require('../config')

class RedisClient extends EventEmitter {
    constructor(connectionOptions = { url: REDIS_URL, username: '', password: '' }) {
        super()
        this.options = connectionOptions
        this.connection = null
        this.open()
    }

    open() {
        const connection = redis.createClient(this.options)
        this.connection = connection
        this.connection.on('error', (error) => { this.emit('error', error) })
        this.connection.connect()
        this.emit('open')
    }
    
    async close() {
        await this.connection.disconnect()
        this.emit('close')
    }

    async get(key) {
        const cachedData = await this.connection.get(key)
        return cachedData
    }

    async set(key, data) {
        await this.connection.set(key, JSON.stringify(data))
        return true
    }
}

module.exports = { RedisClient }