import hasher from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { email } = req.body;
    const { password } = req.body;
    const usersCollection = dbClient.client.db().collection('users');

    if (!email) return res.status(400).json({ error: 'Missing email' });
    if (!password) return res.status(400).json({ error: 'Missing password' });
    const userExist = await usersCollection.findOne({ email });

    if (userExist) return res.status(400).json({ error: 'Already exist' });
    const hashedPassword = hasher(password);
    const user = { email, password: hashedPassword };
    const entry = await usersCollection.insertOne(user);
    return res.status(201).json({ id: entry.insertedId, email });
  }
}
export default UsersController;
