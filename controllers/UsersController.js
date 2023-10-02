import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const crypto = require('crypto');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (redisClient.isAlive() && dbClient.isAlive()) {
      if (!email) {
        res.status(400).send({ error: 'Missing email' });
      } else if (!password) {
        res.status(400).send({ error: 'Missing email' });
      } else {
        const DB = dbClient.client.db();
        if (await DB.collection('users').findOne({ email })) {
          res.status(400).json({ error: 'Already exist' });
        } else {
          const user = this.hashPassword(email, password);
          const result = await DB.collection('users').insertOne(user);
          const { ops } = result;
          res.status(201).json(
            {
              id: ops[0]._id,
              email: ops[0].email,
            },
          );
        }
      }
    }
  }

  static hashPassword(email, password) {
    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
    const user = {
      email,
      password: hashedPassword,
    };
    return user;
  }

  static async getMe(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    const userCollection = dbClient.client.db().collection('users');
    const user = userCollection.findById(userId);
    if (!userId) return res.status(401).json({ error: 'Unathorized' });
    return { email: user.email, id: user.id };
  }
}
export default UsersController;
