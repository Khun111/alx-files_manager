import Buffer from 'node:buffer'
import dbClient from '../utils/db'
import redisClient from '../utils/redis'
import hash from 'sha1'

class AuthController {
    static async getConnect(req, res) {
        authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Basic ')) return res.status(401).json({error: 'Unathorized'})
        credentials = Buffer.from(authHeader.slice(6), 'base64').toString().split(':')
        const [email, password] = credentials
        const userCollection = dbClient.client.db().collection('users')
        const user = userCollection.findOne({email})
        const hashedPassword = hash(password)
        if (!user || hashedPassword !== user.password) return res.status(401).json({error: 'Unathorized'})
        const token = uuid.v4()
        const key = `auth_${token}`
        await redisClient.set(key, user.id, 86400)
        return res.status(200).json({token})
    async getDisConnect(req, res) {
        const token = req.header('X-Token')
        const key = `auth_${token}`
        const userId = await redisClient.get(key)
        const userCollection = dbClient.client.db().collection('users')
        const user = userCollection.findById(userId)
        if (!userId) return res.status(401).json({error: 'Unathorized'})
        else await redisClient.del(key)
        return res.status(204).send()
    }
}
export default AuthController;
