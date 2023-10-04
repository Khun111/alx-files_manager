import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static async  getStatus(_, res) {
    const red = await redisClient.isAlive();
    const db = await dbClient.isAlive();
    return res.status(200).json({ redis: red, db: db });
  }

  static async getStats(_, res) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();
    res.status(200).json({ users, files });
  }
}

export default AppController;
