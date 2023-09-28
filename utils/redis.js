import { CreateClient } from 'redis'
import { promisify } from 'util'
class RedisClient {
    constructor() {
        this.client = CreateClient();
        this.client.on('error', (err) => console.log(err.message))
    }
    const getAsync = promisify(this.client.get).bind(this.client)
    const setAsync = promisify(this.client.set).bind(this.client)
    const delAsync = promisify(this.client.del).bind(this.client)

    isAlive() {
        return this.client.isReady()
    }
    
    async get(key) {
        const value = await getAsync(key)
        return value;
    }
    async set(key, value, time) {
        await setAsync(key, value, {EX: time})
    }
    async del(key) {
        await delAsync(key)
    }
}

const redisClient = new RedisClient()
export default redisClient;
