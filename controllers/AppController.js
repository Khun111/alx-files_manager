import redisClient from '../utils/redis'
import dbClient from '../utils/db'

function getStatus(req, res) {
    if (redisClient.isAlive() && db.isAlive()) {
        res.status(200).json({ "redis": true, "db": true })
    }
}

function getStats(req, res) {
    res.status(200).json({ "users": dbClient.nbUsers(), "files": dbClient.nbFiles() })
}
