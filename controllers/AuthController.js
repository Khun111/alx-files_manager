import hash from 'sha1';
import uuid from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) return res.status(401).json({ error: 'Unathorized' });
    const credentials = Buffer.from(authHeader.split('Basic ')[1], 'base64').toString('utf-8');
    const [email, password] = credentials;
    const userCollection = dbClient.client.db().collection('users');
    const user = userCollection.findOne({ email });
    const hashedPassword = hash(password);
    if (!user || hashedPassword !== user.password) return res.status(401).json({ error: 'Unathorized' });
    const token = uuid.v4();
    const key = `auth_${token}`;
    await redisClient.set(key, user.id, 86400);
    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    const userCollection = dbClient.client.db().collection('users');
    const user = userCollection.findById(userId);
    if (!user) return res.status(401).json({ error: 'Unathorized' });
    await redisClient.del(key);
    return res.status(204).send();
  }
}
export default AuthController;
